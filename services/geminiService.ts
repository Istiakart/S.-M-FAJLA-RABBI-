
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a professional summary for marketing case studies.
 * Strictly follows the @google/genai SDK standards:
 * - Uses ai.models.generateContent (not getGenerativeModel).
 * - Accesses the .text property (not the text() method).
 * - Uses process.env.API_KEY for secure key management.
 */
export const generateCaseStudySummary = async (stats: string) => {
  try {
    // Initializing the AI client using the mandatory process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Model: gemini-3-flash-preview is the recommended high-speed model for text tasks.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Process these campaign metrics: ${stats}`,
      config: {
        systemInstruction: "Act as a senior growth marketing expert at Skill Room Bangladesh IT. Your task is to transform raw campaign metrics into a professional, one-sentence case study insight (max 60 words). Focus heavily on ROI, Meta Ads scaling, and the precision methodology of Skill Room. Be authoritative and results-oriented.",
        temperature: 0.7,
        topP: 0.95,
      }
    });

    // Accessing .text as a property directly from the response.
    return response.text || "Summary generation completed.";
  } catch (error) {
    console.error("Gemini SDK Execution Error:", error);
    return "The AI Lab is currently processing. Please try again in a few moments.";
  }
};
