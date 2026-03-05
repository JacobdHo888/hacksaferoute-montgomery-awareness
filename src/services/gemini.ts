import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getSafetyExplanation(routeData: any) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the following travel route in Montgomery, Alabama and provide a structured safety explanation.
    Route Details: ${JSON.stringify(routeData)}
    
    Format the response in Markdown using the following structure:
    
    ### 📋 Route Overview
    A brief 1-2 sentence summary of the route's general safety profile.
    
    ### ⚠️ Risk Assessment
    * **Incident Density:** [Summary of 911/Crime activity]
    * **Environmental Hazards:** [Weather/Flood risks]
    * **Infrastructure:** [Lighting/Construction/Road conditions]
    
    ### 🛡️ Safety Recommendations
    * [Specific actionable advice for this route]
    * [Nearby emergency resources to keep in mind]
    
    ### 💡 AI Insight
    A short, punchy concluding thought on why this route was (or wasn't) recommended.
    
    Keep the tone professional, transparent, and focused on public safety data.
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
