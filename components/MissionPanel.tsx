import React from 'react';
import { LocationData, AppState, TravelMission } from '../types';
import { Compass, Radio, Shield, ExternalLink, Zap } from 'lucide-react';

interface MissionPanelProps {
  state: AppState;
  data: LocationData | null;
  onClose: () => void;
}

const MissionPanel: React.FC<MissionPanelProps> = ({ state, data, onClose }) => {
  if (state === AppState.IDLE) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-[480px] glass-panel transition-transform duration-500 ease-out p-6 flex flex-col z-20 overflow-hidden border-l border-cyan-500/30">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full relative"></div>
          </div>
          <h2 className="text-2xl font-bold text-cyan-100 tracking-widest uppercase font-mono">
            {state === AppState.SCANNING || state === AppState.ANALYZING ? 'System Active' : 'Target Locked'}
          </h2>
        </div>
        <button 
          onClick={onClose}
          className="text-cyan-400 hover:text-white transition-colors"
        >
          [CLOSE]
        </button>
      </div>

      {/* Loading State */}
      {(state === AppState.SCANNING || state === AppState.ANALYZING) && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-cyan-300 font-mono animate-pulse">
            {state === AppState.SCANNING ? 'CALIBRATING SENSORS...' : 'DECODING BIO-SIGNATURES...'}
          </p>
          <div className="w-full bg-cyan-900/30 h-1 mt-4">
             <div className="h-full bg-cyan-400 animate-[width_2s_ease-in-out_infinite]" style={{width: '50%'}}></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {state === AppState.ERROR && (
        <div className="flex-1 flex flex-col items-center justify-center text-amber-400 font-mono">
          <Shield className="w-12 h-12 mb-4" />
          <p>SIGNAL LOST. ORBITAL INTERFERENCE DETECTED.</p>
        </div>
      )}

      {/* Results State */}
      {state === AppState.RESULTS && data && (
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-20">
          
          {/* Coordinates / Header Data */}
          <div className="border-b border-cyan-500/30 pb-4">
            <h3 className="text-sm text-cyan-400 uppercase tracking-widest mb-1">Target Location</h3>
            <p className="text-xl text-white font-mono break-words">{data.address}</p>
          </div>

          {/* Missions List */}
          <div className="space-y-4">
            <h3 className="text-sm text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4" /> Available Missions
            </h3>
            
            {data.missions.map((mission, idx) => (
              <MissionCard key={mission.id || idx} mission={mission} />
            ))}
          </div>

          {/* Grounding Sources */}
          {data.groundingLinks.length > 0 && (
            <div className="mt-8 pt-4 border-t border-cyan-500/30">
               <h3 className="text-xs text-cyan-500 uppercase tracking-widest mb-3">Planetary Intelligence Sources</h3>
               <div className="flex flex-wrap gap-2">
                 {data.groundingLinks.map((link, i) => {
                   const item = link.web || link.maps;
                   if (!item) return null;
                   return (
                     <a 
                      key={i} 
                      href={item.uri} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs bg-cyan-900/40 text-cyan-300 px-2 py-1 rounded border border-cyan-500/20 hover:bg-cyan-800/60 transition"
                     >
                       <ExternalLink className="w-3 h-3" />
                       {item.title.length > 20 ? item.title.substring(0,20)+'...' : item.title}
                     </a>
                   )
                 })}
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MissionCard: React.FC<{ mission: TravelMission }> = ({ mission }) => {
  // Determine color based on difficulty - Switched "Extreme" and "High" from Red/Orange to Purple/Fuchsia
  const diffColor = {
    'Low': 'text-green-400 border-green-500/30',
    'Medium': 'text-cyan-400 border-cyan-500/30',
    'High': 'text-purple-400 border-purple-500/30',
    'Extreme': 'text-fuchsia-400 border-fuchsia-500/30',
  }[mission.difficulty] || 'text-cyan-400 border-cyan-500/30';

  return (
    <div className="bg-black/40 border border-cyan-500/20 p-4 rounded hover:bg-cyan-900/10 transition group">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">{mission.realLocation}</h4>
        <span className={`text-xs px-2 py-0.5 border rounded ${diffColor}`}>
          LVL: {mission.difficulty}
        </span>
      </div>
      
      <p className="text-cyan-200/80 text-sm mb-3 italic">
        "Simulated Reality: {mission.sciFiTwist}"
      </p>
      
      <p className="text-gray-300 text-sm leading-relaxed mb-3">
        {mission.description}
      </p>
      
      <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3" /> {mission.type}
        </span>
        <span className="flex items-center gap-1">
           <Radio className="w-3 h-3" /> Signal: Strong
        </span>
      </div>
    </div>
  );
};

export default MissionPanel;