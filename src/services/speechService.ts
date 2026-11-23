/**
 * CareerCurve Speech-to-Text (STT) and Text-to-Speech (TTS) Controller
 * Provides synchronized voice playback, live transcription streaming,
 * silence detection, and graceful permission & fallback handling.
 */

export interface SpeechRecognitionCallbacks {
  onTranscriptChange: (interim: string, isFinal: boolean) => void;
  onListeningStart?: () => void;
  onListeningEnd?: () => void;
  onError?: (errorMessage: string, isPermissionDenied?: boolean) => void;
  onSilenceTimeout?: () => void;
}

class SpeechService {
  private recognitionInstance: any = null;
  private isListeningActive = false;
  private isMuted = false;
  private silenceTimer: any = null;
  private silenceTimeoutMs = 3800; // 3.8s silence timeout after speech
  private lastSpokenText = '';
  private currentSpeechId = 0;
  private syntheticSpeakTimer: any = null;

  /**
   * Checks whether the current browser supports Web Speech Recognition.
   */
  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Checks whether the current browser supports Speech Synthesis (TTS).
   */
  public isSpeechSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  /**
   * Speaks the provided text using browser SpeechSynthesis with onEnd callback.
   * Ensures audio finishes before resolving so mic activation is strictly sequential.
   */
  public speakText(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): Promise<void> {
    this.stopSpeaking(); // Cancel any active speech before starting a new one
    const speechId = ++this.currentSpeechId;

    return new Promise((resolve) => {
      if (!this.isSpeechSynthesisSupported() || this.isMuted) {
        options?.onStart?.();
        // Fallback synthetic delay simulating speaking duration if muted or unsupported
        const simulatedDurationMs = Math.min(6000, Math.max(1500, text.split(/\s+/).length * 280));
        this.syntheticSpeakTimer = setTimeout(() => {
          if (this.currentSpeechId === speechId) {
            options?.onEnd?.();
          }
          resolve();
        }, simulatedDurationMs);
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options?.rate || 0.95;
        utterance.pitch = options?.pitch || 1.0;
        utterance.volume = options?.volume !== undefined ? options?.volume : 1.0;

        // Choose a clear, natural English voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira')) &&
            v.lang.startsWith('en')
        ) || voices.find((v) => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          if (this.currentSpeechId === speechId) {
            options?.onStart?.();
          }
        };

        utterance.onend = () => {
          if (this.currentSpeechId === speechId) {
            options?.onEnd?.();
          }
          resolve();
        };

        utterance.onerror = (e) => {
          // If cancelled deliberately, ignore without error
          if ((e as any)?.error === 'canceled' || (e as any)?.error === 'interrupted') {
            resolve();
            return;
          }
          console.warn('SpeechSynthesis error:', e);
          if (this.currentSpeechId === speechId) {
            options?.onError?.(e);
          }
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Failed to invoke SpeechSynthesis:', err);
        options?.onError?.(err);
        resolve();
      }
    });
  }

  /**
   * Cancels active speech synthesis playback.
   */
  public stopSpeaking(): void {
    this.currentSpeechId++;
    if (this.syntheticSpeakTimer) {
      clearTimeout(this.syntheticSpeakTimer);
      this.syntheticSpeakTimer = null;
    }
    if (this.isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  /**
   * Pauses active speech synthesis.
   */
  public pauseSpeaking(): void {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.pause();
    }
  }

  /**
   * Resumes paused speech synthesis.
   */
  public resumeSpeaking(): void {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.resume();
    }
  }

  public isSpeaking(): boolean {
    if (!this.isSpeechSynthesisSupported()) return false;
    return window.speechSynthesis.speaking;
  }

  public isPausedSpeaking(): boolean {
    if (!this.isSpeechSynthesisSupported()) return false;
    return window.speechSynthesis.paused;
  }

  /**
   * Toggles speech audio mute state.
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopSpeaking();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Starts listening to candidate speech, streaming interim & final transcription,
   * with automatic silence detection and graceful permission handling.
   */
  public async startListening(callbacks: SpeechRecognitionCallbacks): Promise<boolean> {
    if (!this.isSpeechRecognitionSupported()) {
      callbacks.onError?.('Web Speech Recognition is not supported by your browser. Please use the typed input box below.');
      return false;
    }

    // Explicitly request microphone permission first
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release immediate test stream; speech recognition will manage its own audio track
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (permErr: any) {
      console.warn('Microphone permission denied or not found:', permErr);
      callbacks.onError?.('Microphone permission was denied. Please allow microphone access in your browser or type your answer.', true);
      return false;
    }

    this.stopListening(); // Stop any existing session
    this.clearSilenceTimer();

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognitionInstance = new SpeechRecognition();
      this.recognitionInstance.continuous = true;
      this.recognitionInstance.interimResults = true;
      this.recognitionInstance.lang = 'en-US';

      let accumulatedFinal = '';

      this.recognitionInstance.onstart = () => {
        this.isListeningActive = true;
        callbacks.onListeningStart?.();
      };

      this.recognitionInstance.onresult = (event: any) => {
        let currentInterim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            accumulatedFinal += (accumulatedFinal ? ' ' : '') + transcript;
          } else {
            currentInterim += transcript;
          }
        }

        const fullText = (accumulatedFinal + (currentInterim ? ' ' + currentInterim : '')).trim();
        callbacks.onTranscriptChange(fullText, false);

        // Reset silence timer whenever speech is actively detected
        if (fullText.length > 0) {
          this.resetSilenceTimer(callbacks.onSilenceTimeout);
        }
      };

      this.recognitionInstance.onerror = (event: any) => {
        const errType = event.error;
        console.warn('SpeechRecognition error:', errType);
        if (errType === 'not-allowed') {
          callbacks.onError?.('Microphone permission was denied.', true);
        } else if (errType === 'audio-capture') {
          callbacks.onError?.('No microphone detected on your system.');
        } else if (errType === 'network') {
          callbacks.onError?.('Speech recognition network timeout. Please check your connection or type your answer.');
        } else if (errType !== 'no-speech') {
          callbacks.onError?.(`Speech recognition notice: ${errType}`);
        }
      };

      this.recognitionInstance.onend = () => {
        this.isListeningActive = false;
        this.clearSilenceTimer();
        callbacks.onListeningEnd?.();
      };

      this.recognitionInstance.start();
      return true;
    } catch (err: any) {
      console.error('Failed to start SpeechRecognition:', err);
      callbacks.onError?.('Failed to activate voice recognition. Please use the typed input box.');
      return false;
    }
  }

  /**
   * Stops active speech recognition and clears timers.
   */
  public stopListening(): void {
    this.clearSilenceTimer();
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch {}
      this.recognitionInstance = null;
    }
    this.isListeningActive = false;
  }

  public isListening(): boolean {
    return this.isListeningActive;
  }

  private resetSilenceTimer(onSilenceTimeout?: () => void): void {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      onSilenceTimeout?.();
    }, this.silenceTimeoutMs);
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * Complete reset: stops audio playback and speech recognition.
   */
  public terminateAll(): void {
    this.stopSpeaking();
    this.stopListening();
  }
}

export const speechService = new SpeechService();
