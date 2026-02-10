
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Generates a professional summary for marketing case studies.
 */
export const generateCaseStudySummary = async (stats: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Process these campaign metrics: ${stats}`,
      config: {
        systemInstruction: "Act as a senior growth marketing expert. Transform raw metrics into a professional one-sentence case study insight (max 60 words). Focus on ROI and precision.",
        temperature: 0.7,
      }
    });
    return response.text || "Summary generation completed.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI is currently processing data.";
  }
};

/**
 * Extracts structured marketing data from an image using Gemini Vision.
 */
export const analyzeMarketingImage = async (base64Data: string, mimeType: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: "Extract marketing data from this screenshot. Focus on Campaign Name, Total Results (e.g., messages, leads, reach), and Efficiency (e.g., cost per result). Return the data in a clear structured way.",
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The likely campaign or project name" },
            category: { type: Type.STRING, description: "E-commerce, Leads, or Engagement" },
            results: { type: Type.STRING, description: "Total results with unit, e.g. '142 Messages'" },
            efficiency: { type: Type.STRING, description: "Cost per result, e.g. 'BDT 8.20/Conv'" },
            description: { type: Type.STRING, description: "A short 1-sentence summary of the performance seen in the image" },
          },
          required: ["title", "category", "results", "efficiency", "description"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Vision AI Error:", error);
    throw error;
  }
};
