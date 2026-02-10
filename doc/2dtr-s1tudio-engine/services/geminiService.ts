
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { DTPPlan } from "../types";

// Always create a fresh instance to ensure the latest API key is used
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Robust Minimal Fallback Structure
// Fix: Removed invalid properties to comply with the DTPPlan interface in types.ts
const DEFAULT_FALLBACK_PLAN: DTPPlan = {
  structure: {
    chapters: [{
      title: "Introduction",
      assets: [],
      layoutType: 'standard'
    }]
  },
  typography: {
    bodyFont: "'Crimson Pro', serif",
    colorPalette: {
      primary: "#0f172a",
      accent: "#6366f1"
    }
  }
};

export const generateIllustration = async (prompt: string, style: string, type: 'art' | 'infographic' | 'icon' = 'art'): Promise<string | null> => {
  const ai = getAI();
  const enhancedPrompt = type === 'infographic' 
    ? `Generate a professional technical infographic. Style: ${style}. Schematic, clean lines. Subject: ${prompt}`
    : type === 'icon'
    ? `Generate a single symbolic black vector icon on white. Style: ${style}. Subject: ${prompt}.`
    : `Generate a high-quality illustration in ${style} style. Subject: ${prompt}. Cinematic composition.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: enhancedPrompt }] },
      config: { imageConfig: { aspectRatio: type === 'icon' ? "1:1" : "16:9" } }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Asset Generation Error:", e);
    throw e;
  }
};

export const analyzeBookContent = async (text: string, useGrounding: boolean = false, useThinking: boolean = false): Promise<DTPPlan & { groundingSources?: any[] }> => {
  const ai = getAI();
  // modelName should be a mutable variable to allow override when thinking is requested
  let modelName = 'gemini-3-flash-preview'; 
  const config: any = { 
    systemInstruction: SYSTEM_PROMPT, 
    responseMimeType: "application/json" 
  };
  
  if (useThinking) {
    // For more complex layouts or if user explicitly requested deep reasoning
    modelName = 'gemini-3-pro-preview';
    config.thinkingConfig = { thinkingBudget: 24576 };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Perform high-end DTP analysis on this manuscript:\n\n${text}`,
      config
    });
    
    // Accessing .text property directly as per SDK guidelines
    const resultText = response.text;
    if (!resultText) throw new Error("Empty AI response.");
    
    try {
      const parsed = JSON.parse(resultText.trim());
      // Validate minimal structure and inject missing fields for consistency
      if (parsed.structure && parsed.structure.chapters) {
        parsed.structure.chapters = parsed.structure.chapters.map((ch: any) => ({
          ...ch,
          density: ch.density || 'normal',
          layoutType: ch.layoutType || 'standard',
          assets: ch.assets || []
        }));
      }
      return parsed;
    } catch (parseError) {
      console.warn("Invalid JSON from AI, returning default plan.", parseError);
      return DEFAULT_FALLBACK_PLAN;
    }
  } catch (e: any) { 
    console.error("Manuscript Analysis Failure:", e);
    // Guidelines state we should propagate key selection errors up to the UI
    if (e.message?.includes("Requested entity was not found")) throw e;
    return DEFAULT_FALLBACK_PLAN;
  }
};
