import { GoogleGenAI } from "@google/genai";
import { LocationData, TravelMission } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLocation = async (lat: number, lng: number): Promise<LocationData> => {
  try {
    // We enforce a specific text format for easier parsing since JSON mode isn't available with Tools in this model version
    const prompt = `
      I am scanning the Earth at coordinates: Latitude ${lat}, Longitude ${lng}.
      
      Your task is to act as a 31st-century "Galactic Travel Agent".
      
      Step 1: Use Google Maps to identify the exact City and Country (or specific region) for these coordinates.
      Step 2: Find 3 distinct real-world landmarks or points of interest nearby.
      Step 3: Generate a sci-fi "Mission" for each landmark using the CREATIVE RULES below.

      *** CREATIVE RULES FOR SPECIAL REGIONS ***
      If the location is in **CHINA**, adapt the "sciFiTwist" specifically:
      - **Xinjiang (e.g., Kashgar)**: Theme as "Interstellar Silk Road" or "Ancient Galactic Caravan Post". (e.g. "Immersive Trade Negotiation").
      - **Inner Mongolia**: Theme as "Alien Nomadic Civilization" or "Terraforming Pastures". (e.g. "Simulation Camping").
      - **Tibet (e.g., Everest/Lhasa)**: Theme as "Cosmic Ray Observatory", "High-Altitude Uplink", or "Spirituality & Tech Sanctuary".
      - **General China**: Blend ancient tradition with cyberpunk or orbital tech.

      OUTPUT FORMAT (Strictly follow this):
      
      LOCATION: [City, Country]
      
      ---
      MISSION: [Real Landmark Name]
      TWIST: [Sci-Fi Renaming of the Landmark]
      TYPE: [Exploration | Diplomacy | Survival | Research]
      DIFFICULTY: [Low | Medium | High | Extreme]
      DESCRIPTION: [A 2-sentence briefing blending real history with the specific sci-fi theme]
      ---
      MISSION: [Next Landmark Name]
      ...
      
      (Repeat for 3 missions. Ensure fields are labeled exactly as above.)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        systemInstruction: "You are an immersive sci-fi interface specializing in Earth-based galactic tourism. You provide structured data about Earth locations interpreted as future planetary sectors. For Chinese regions, strictly adhere to the specific cultural sci-fi themes provided.",
      },
    });

    const text = response.text || "";
    
    // Extract grounding metadata if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingLinks = chunks
      .map((chunk: any) => {
        if (chunk.web) return { web: chunk.web };
        if (chunk.maps) return { maps: chunk.maps };
        return null;
      })
      .filter(Boolean) as any[];

    // --- Parsing Logic ---

    // 1. Extract Address
    // Look for "LOCATION:" followed by text until end of line
    const locationMatch = text.match(/LOCATION:\s*(.+)$/m);
    // If not found, use coordinates as fallback
    const address = locationMatch 
      ? locationMatch[1].trim() 
      : `Sector: ${lat.toFixed(2)}, ${lng.toFixed(2)}`;

    // 2. Extract Missions
    const missions: TravelMission[] = [];
    
    // Split by the separator "---"
    const blocks = text.split('---').map(b => b.trim()).filter(b => b.length > 0);

    blocks.forEach((block, index) => {
       // Only process blocks that look like missions (contain "MISSION:")
       if (!block.includes('MISSION:')) return;

       const getValue = (key: string) => {
         const regex = new RegExp(`${key}:\\s*(.+)`, 'i');
         const match = block.match(regex);
         return match ? match[1].trim() : null;
       };

       const realLocation = getValue('MISSION') || `Unknown Site ${index + 1}`;
       const sciFiTwist = getValue('TWIST') || "Unidentified Anomaly";
       const typeRaw = getValue('TYPE') || "Exploration";
       const difficultyRaw = getValue('DIFFICULTY') || "Medium";
       // Description might be multi-line, so we grab it carefully or just take the rest
       const descMatch = block.match(/DESCRIPTION:\s*([\s\S]+)/i);
       const description = descMatch ? descMatch[1].trim() : "No briefing data available.";

       // Normalize Enum values
       let type: any = 'Exploration';
       if (/Diplomacy/i.test(typeRaw)) type = 'Diplomacy';
       if (/Survival/i.test(typeRaw)) type = 'Survival';
       if (/Research/i.test(typeRaw)) type = 'Research';

       let difficulty: any = 'Medium';
       if (/Low/i.test(difficultyRaw)) difficulty = 'Low';
       if (/High/i.test(difficultyRaw)) difficulty = 'High';
       if (/Extreme/i.test(difficultyRaw)) difficulty = 'Extreme';

       missions.push({
         id: `m-${index}`,
         name: `Objective ${index + 1}`,
         realLocation,
         sciFiTwist,
         description,
         type,
         difficulty
       });
    });

    // Fallback: if structured parsing failed entirely (model didn't follow format)
    if (missions.length === 0) {
        missions.push({
            id: 'default',
            name: 'General Survey',
            realLocation: address.includes('Sector') ? 'Unknown Region' : address,
            sciFiTwist: 'Planetary Scan',
            description: text.substring(0, 300) + '...', // Fallback to raw text
            type: 'Research',
            difficulty: 'Medium'
        });
    }

    return {
      address,
      missions,
      groundingLinks
    };

  } catch (error) {
    console.error("Gemini Scan Error:", error);
    throw error;
  }
};