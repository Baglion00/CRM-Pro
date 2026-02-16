import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_AI_API_KEY || '';
const AI_MODEL = 'gemini-2.0-flash';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Migliora la descrizione di un servizio/prodotto per un preventivo professionale.
 * Utilizza un modello AI generativo per riscrivere il testo in modo più persuasivo.
 */
export const improveDescription = async (text: string, itemName: string): Promise<string> => {
    if (!ai) return text;
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
            model: AI_MODEL,
            contents: prompt,
        });

        return response.text?.trim() || text;
    } catch (error) {
        console.error("AI Service Error:", error);
        return text;
    }
};

/**
 * Analizza un sito web per estrarre automaticamente i dati aziendali.
 * Utile per compilare rapidamente le informazioni della propria azienda.
 */
export const fetchCompanyData = async (url: string): Promise<any> => {
    if (!ai || !url) return null;

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
            model: AI_MODEL,
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
        console.error("AI Service Error:", error);
        return null;
    }
};
