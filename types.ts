export interface Coordinate {
  lat: number;
  lng: number;
}

export interface TravelMission {
  id: string;
  name: string;
  realLocation: string;
  sciFiTwist: string;
  description: string;
  difficulty: 'Low' | 'Medium' | 'High' | 'Extreme';
  type: 'Exploration' | 'Diplomacy' | 'Survival' | 'Research';
}

export interface GroundingMetadata {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string };
}

export interface LocationData {
  address: string;
  missions: TravelMission[];
  groundingLinks: GroundingMetadata[];
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}
