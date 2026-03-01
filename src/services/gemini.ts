import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getSafetyExplanation(routeData: any) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the following travel route in Montgomery, Alabama and provide a safety explanation.
    Route Details: ${JSON.stringify(routeData)}
    
    The explanation should be human-readable, professional, and focus on transparency. 
    Mention specific factors like 911 call density, crime activity, flood zones, and proximity to emergency services if relevant.
    
    Format the response in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating safety explanation:", error);
    return "Unable to generate safety explanation at this time. Please proceed with caution.";
  }
}
