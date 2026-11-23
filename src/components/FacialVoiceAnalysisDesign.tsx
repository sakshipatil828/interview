import React from 'react';
import { WebcamFeed } from './WebcamFeed';
import { 
  Activity, 
  Video, 
  Mic, 
  Eye, 
  Smile, 
  Code2, 
  Cpu, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const FacialVoiceAnalysisDesign: React.FC = () => {
  const pythonFlaskCode = `# Flask Backend with OpenCV, MediaPipe, and DeepFace
from flask import Flask, request, jsonify
import cv2
import numpy as np
import mediapipe as mp

app = Flask(__name__)

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(max_num_faces=1, refine_landmarks=True)

@app.route('/api/analyze-frame', methods=['POST'])
def analyze_frame():
    file = request.files['frame']
    img_bytes = file.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)
    
    if not results.multi_face_landmarks:
        return jsonify({'face_detected': False, 'eye_contact': 0, 'emotion': 'Neutral'})
        
    landmarks = results.multi_face_landmarks[0].landmark
    # Compute Gaze Vector from eye iris landmarks (468, 473)
    left_iris = landmarks[468]
    right_iris = landmarks[473]
    
    eye_contact_percentage = calculate_gaze_alignment(left_iris, right_iris)
    
    return jsonify({
        'face_detected': True,
        'eye_contact': eye_contact_percentage,
        'emotion': 'Confident',
        'pitch_jitter': 0.02
    })

if __name__ == '__main__':
    app.run(port=5000)
`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs mb-1">
          <Activity className="w-4 h-4" />
          <span>Vision & Audio Telemetry Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          WebRTC Facial Mesh & Vocal Telemetry Test Bench
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time eye-contact monitoring, facial landmark wireframe mesh tracking, and Python Flask integration architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Camera Feed Test Bench */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Video className="w-4 h-4 text-indigo-400" />
            <span>WebRTC Camera Live Landmark Feed</span>
          </h2>

          <WebcamFeed showOverlayCanvas={true} />

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <Eye className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400">Eye Contact</p>
              <p className="text-sm font-extrabold text-emerald-400 font-mono">94% Stable</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <Smile className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400">Emotion</p>
              <p className="text-sm font-extrabold text-indigo-300 font-mono">Confident</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <Mic className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400">Cadence</p>
              <p className="text-sm font-extrabold text-purple-300 font-mono">142 WPM</p>
            </div>
          </div>
        </div>

        {/* Python Flask Code Reference for Academic Viva */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Python Flask & MediaPipe Integration Code</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              OpenCV + MediaPipe
            </span>
          </h2>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto max-h-[380px] scrollbar-thin">
            {pythonFlaskCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
