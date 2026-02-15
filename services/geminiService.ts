
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, SentimentLabel } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeReview = async (text: string): Promise<Omit<AnalysisResult, 'id' | 'timestamp' | 'originalText'>> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following customer service review or complaint: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A concise 1-sentence summary of the review.",
          },
          sentiment: {
            type: Type.STRING,
            description: "The primary sentiment: Positive, Neutral, Negative, or Critical.",
          },
          score: {
            type: Type.NUMBER,
            description: "A sentiment score from 0 (very negative) to 100 (very positive).",
          },
          keyIssues: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of specific pain points or highlights mentioned.",
          },
        },
        required: ["summary", "sentiment", "score", "keyIssues"],
      },
      systemInstruction: "You are an expert customer experience analyst. Your goal is to provide deep insights into customer feedback. Be objective and prioritize identifying actionable issues.",
    },
  });

  try {
    // Correctly extract text output using the .text property
    const data = JSON.parse(response.text || "{}");
    return {
      summary: data.summary || "No summary available.",
      sentiment: (data.sentiment as SentimentLabel) || "Neutral",
      score: data.score || 50,
      keyIssues: data.keyIssues || [],
    };
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Invalid response format from analysis engine.");
  }
};
