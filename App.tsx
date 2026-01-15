import React, { useState, useCallback } from 'react';
import SciFiGlobe from './components/SciFiGlobe';
import MissionPanel from './components/MissionPanel';
import { analyzeLocation } from './services/geminiService';
import { AppState, Coordinate, LocationData } from './types';
import { Radar, ScanLine, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedLocation, setSelectedLocation] = useState<Coordinate | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const handleLocationSelect = useCallback(async (coord: Coordinate) => {
    setSelectedLocation(coord);
    setAppState(AppState.SCANNING);
    
    // Simulate initial scan delay for effect
    setTimeout(async () => {
      setAppState(AppState.ANALYZING);
      try {
        const data = await analyzeLocation(coord.lat, coord.lng);
        setLocationData(data);
        setAppState(AppState.RESULTS);
      } catch (error) {
        console.error(error);
        setAppState(AppState.ERROR);
      }
    }, 1500);
  }, []);

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setSelectedLocation(null);
    setLocationData(null);
  };

  return (
    <div className="relative w-full h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* The Globe handles the background starfield too via its props, but we add a vignette here */}
        <SciFiGlobe 
          onLocationSelect={handleLocationSelect} 
          selectedLocation={selectedLocation}
        />
      </div>

      {/* UI Overlay: HUD Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top Left: Title */}
        <div className="absolute top-8 left-8 p-4 border-l-2 border-cyan-500 bg-black/20 backdrop-blur-sm">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 uppercase tracking-tighter">
            Interstellar<br/>Traveler
          </h1>
          <p className="text-xs text-cyan-300/70 font-mono mt-2 tracking-widest">
            PLANETARY RECONNAISSANCE INTERFACE V.3024
          </p>
        </div>

        {/* Bottom Left: Status */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-2 font-mono text-xs text-cyan-500/60">
           <div className="flex items-center gap-2">
             <Radar className={`w-4 h-4 ${appState !== AppState.IDLE ? 'animate-spin' : ''}`} />
             <span>SENSORS: {appState === AppState.IDLE ? 'STANDBY' : 'ACTIVE'}</span>
           </div>
           <div>LAT: {selectedLocation?.lat.toFixed(4) || '---'}</div>
           <div>LNG: {selectedLocation?.lng.toFixed(4) || '---'}</div>
        </div>

        {/* Crosshairs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-cyan-500/10 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-cyan-500/50 rounded-full"></div>
        </div>
      </div>

      {/* Interaction Panel */}
      <div className="absolute inset-y-0 right-0 z-20 pointer-events-auto">
        <MissionPanel 
          state={appState} 
          data={locationData} 
          onClose={handleReset} 
        />
      </div>

      {/* Initial Prompt */}
      {appState === AppState.IDLE && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-6 py-3 rounded-full flex items-center gap-3 animate-bounce">
            <ScanLine className="text-cyan-400 w-5 h-5" />
            <span className="text-cyan-100 font-mono text-sm tracking-widest">CLICK GLOBE TO INITIATE SCAN</span>
          </div>
        </div>
      )}
      
      {/* API Key Warning (Development Only) */}
      {!process.env.API_KEY && (
        <div className="absolute top-0 left-0 w-full bg-amber-900/80 text-white text-center p-2 z-50 font-bold flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5"/>
          <span>CRITICAL SYSTEM FAILURE: API_KEY MISSING IN ENVIRONMENT</span>
        </div>
      )}
    </div>
  );
};

export default App;