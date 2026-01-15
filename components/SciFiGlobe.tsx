import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { Coordinate } from '../types';

// Sci-fi visual constants
const RINGS_MAX_R = 5; // deg
const RING_PROPAGATION_SPEED = 5; // deg/sec

interface SciFiGlobeProps {
  onLocationSelect: (coord: Coordinate) => void;
  selectedLocation: Coordinate | null;
}

const SciFiGlobe: React.FC<SciFiGlobeProps> = ({ onLocationSelect, selectedLocation }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [ringsData, setRingsData] = useState<any[]>([]);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial Auto-Rotate
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.6;
    }
  }, []);

  // Update rings when location selected
  useEffect(() => {
    if (selectedLocation) {
      const { lat, lng } = selectedLocation;
      // Stop rotation when user interacts
      if (globeEl.current) {
        globeEl.current.controls().autoRotate = false;
        // Zoom in much closer (altitude 0.35) for a "High Precision" scan feel
        globeEl.current.pointOfView({ lat, lng, altitude: 0.35 }, 2000);
      }

      // Create a "Targeting" ring effect
      const newRings = [
        { lat, lng, maxR: RINGS_MAX_R, propagationSpeed: RING_PROPAGATION_SPEED, repeatPeriod: 800 }
      ];
      setRingsData(newRings);
    }
  }, [selectedLocation]);

  // Generate "Orbital Traffic" (Arcs) instead of "Pillars" (Points)
  // This removes the spikey look and replaces it with smooth flight paths
  const arcsData = useMemo(() => {
    const N = 20; 
    return [...Array(N).keys()].map(() => {
      const startLat = (Math.random() - 0.5) * 160;
      const startLng = (Math.random() - 0.5) * 360;
      const endLat = (Math.random() - 0.5) * 160;
      const endLng = (Math.random() - 0.5) * 360;
      return {
        startLat,
        startLng,
        endLat,
        endLng,
        // Gradient from Cyan to Violet (No Red)
        color: Math.random() > 0.5 ? ['rgba(6,182,212,0.6)', 'rgba(167,139,250,0.6)'] : ['rgba(167,139,250,0.6)', 'rgba(6,182,212,0.6)']
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <Globe
        ref={globeEl}
        width={windowSize.width}
        height={windowSize.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Atmosphere
        atmosphereColor="#06b6d4" // Cyan atmosphere
        atmosphereAltitude={0.15}
        
        // Interaction
        onGlobeClick={(d) => onLocationSelect({ lat: d.lat, lng: d.lng })}
        
        // Rings (Selection Effect)
        ringsData={ringsData}
        ringColor={() => (t: number) => `rgba(6, 182, 212, ${1 - t})`}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"

        // Arcs (Orbital Flight Paths) - Replaces the pillars
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={0.5}
      />
      
      {/* Overlay Gradient for Sci-Fi Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,10,20,0.6)_100%)]"></div>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(6,182,212,0.1)]"></div>
    </div>
  );
};

export default SciFiGlobe;