
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Extracts structured marketing data from an image using Gemini Flash.
 */
export const analyzeMarketingImage = async (base64Data: string, mimeType: string) => {
  try {
    // Flexible API Key detection
    const apiKey = 
      (process.env as any)?.GEMINI_API_KEY || 
      (process.env as any)?.VITE_GEMINI_API_KEY ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      "";

    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY or VITE_GEMINI_API_KEY in your environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this marketing dashboard or screenshot. Extract: 1. A professional title for the campaign. 2. Category (E-commerce, Leads, or Engagement). 3. Total Results (e.g., 'BDT 50k Sales' or '120 Leads'). 4. Efficiency (e.g., '6.5x ROAS' or 'BDT 12/Lead'). 5. A one-sentence description of the strategy used. Be precise and professional.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The likely campaign or project name" },
            category: { type: Type.STRING, description: "One of: E-commerce, Leads, Engagement, Website Build" },
            results: { type: Type.STRING, description: "Total results with unit" },
            efficiency: { type: Type.STRING, description: "Cost per result or ROAS" },
            description: { type: Type.STRING, description: "A professional summary of what is seen in the image" },
          },
          required: ["title", "category", "results", "efficiency", "description"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Vision AI Error:", error);
    throw error;
  }
};

/**
 * Generates a professional summary for marketing case studies.
 */
export const generateCaseStudySummary = async (stats: string) => {
  try {
    const apiKey = 
      (process.env as any)?.GEMINI_API_KEY || 
      (process.env as any)?.VITE_GEMINI_API_KEY ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      "";

    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY or VITE_GEMINI_API_KEY in your environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a growth marketing insight for these metrics: ${stats}`,
      config: {
        systemInstruction: "You are a senior digital marketing strategist. Provide a short, high-impact insight (max 40 words) focusing on business growth and technical efficiency.",
        temperature: 0.7,
      }
    });
    return response.text || "Insight generated successfully.";
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "Analyzing performance trends...";
  }
};
