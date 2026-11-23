import React, { useState } from 'react';
import { DiagramData } from '../nlp/types';
import { 
  Maximize2, 
  Minimize2, 
  Info, 
  Layers, 
  HelpCircle, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Cpu,
  Compass,
  Zap,
  Gauge
} from 'lucide-react';

interface DiagramViewerProps {
  diagram: DiagramData;
  questionTitle?: string;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({ diagram, questionTitle }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(true);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const getDiagramIcon = () => {
    switch (diagram.type) {
      case 'circuit':
        return Zap;
      case 'power-grid':
        return Zap;
      case 'cad':
        return Compass;
      case 'structural':
        return Layers;
      case 'engine':
        return Gauge;
      default:
        return Cpu;
    }
  };

  const Icon = getDiagramIcon();

  return (
    <div className={`rounded-2xl border border-indigo-500/30 bg-slate-950/90 shadow-2xl transition-all overflow-hidden ${
      isFullscreen ? 'fixed inset-4 z-50 bg-slate-950 flex flex-col' : 'my-4'
    }`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide">{diagram.title}</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {diagram.type}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{diagram.caption}</p>
          </div>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors cursor-pointer"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 transition-colors cursor-pointer ml-1"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Diagram SVG canvas */}
      <div className={`relative flex items-center justify-center p-6 overflow-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 ${
        isFullscreen ? 'flex-1 min-h-0' : 'min-h-[280px] max-h-[460px]'
      }`}>
        {/* Subtle engineering grid background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />

        <div 
          className="transition-transform duration-200 ease-out flex items-center justify-center w-full"
          style={{ transform: `scale(${zoomLevel})` }}
          dangerouslySetInnerHTML={{ __html: diagram.svgContent }}
        />
      </div>

      {/* Technical Parameters & Legend Footer */}
      {(diagram.technicalNotes || diagram.specs) && (
        <div className="px-4 py-3 bg-slate-900/95 border-t border-slate-800 text-xs space-y-2">
          {diagram.specs && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specifications:</span>
              {Object.entries(diagram.specs).map(([k, v]) => (
                <span key={k} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
                  <strong className="text-slate-300">{k}:</strong> {v}
                </span>
              ))}
            </div>
          )}

          {diagram.technicalNotes && diagram.technicalNotes.length > 0 && (
            <div className="flex items-start space-x-2 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                {diagram.technicalNotes.map((note, idx) => (
                  <p key={idx} className="leading-relaxed">
                    • {note}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
