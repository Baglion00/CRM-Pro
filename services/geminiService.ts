import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const improveDescription = async (text: string, itemName: string): Promise<string> => {
  if (!text && !itemName) return "";
  
  try {
    const prompt = `
      Sei un assistente commerciale professionale italiano.
      Migliora la seguente descrizione per un preventivo.
      
      Servizio/Prodotto: ${itemName}
      Descrizione attuale: ${text}
      
      Compito: Riscrivi la descrizione in modo professionale, persuasivo e chiaro, ma conciso (max 2 frasi).
      Usa un tono formale adatto a un preventivo aziendale.
      Restituisci SOLO il testo migliorato.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback to original text if API fails
    return text;
  }
};

export const fetchCompanyData = async (url: string): Promise<any> => {
  if (!url) return null;

  try {
    const prompt = `
      Analizza il sito web fornito: ${url}
      Estrai le seguenti informazioni aziendali se disponibili:
      1. Nome Azienda (o nome del professionista)
      2. Indirizzo completo
      3. Email di contatto
      4. Numero di telefono
      5. Un URL diretto al logo dell'azienda (cerca URL di immagini che sembrano loghi, png o jpg).

      Restituisci un JSON puro.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            address: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            logoUrl: { type: Type.STRING, description: "URL to the logo image found on the web" }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return null;
  }
};