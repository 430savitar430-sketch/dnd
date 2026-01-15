
import { GoogleGenAI, Type } from "@google/genai";
import { Quest, NPC, Language } from "../types";

// Always use the API key directly from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuest = async (theme: string, lang: Language): Promise<Quest> => {
  const prompt = lang === 'tr' 
    ? `Bir D&D oyunu için '${theme}' temalı kısa bir görev oluştur.`
    : `Create a short D&D quest with the theme '${theme}'.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          reward: { type: Type.STRING },
          difficulty: { type: Type.STRING }
        },
        required: ["title", "description", "reward", "difficulty"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateNPC = async (location: string, lang: Language): Promise<NPC> => {
  const prompt = lang === 'tr'
    ? `Bir D&D oyunu için '${location}' konumunda bulunan ilginç bir NPC oluştur.`
    : `Create an interesting NPC located in '${location}' for a D&D game.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          personality: { type: Type.STRING },
          secret: { type: Type.STRING }
        },
        required: ["name", "role", "personality", "secret"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const askGameMaster = async (query: string, lang: Language) => {
  const systemInstruction = lang === 'tr'
    ? "Sen deneyimli bir Zindan Efendisisin (DM). Oyuncularına yaratıcı, atmosferik ve kural sistemlerine uygun cevaplar verirsin. Cevapların Türkçe olmalıdır. Kısa ve öz olmaya özen göster."
    : "You are an experienced Dungeon Master (DM). You provide creative, atmospheric, and system-appropriate answers to your players. Your answers must be in English. Be concise.";

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
    }
  });

  const result = await chat.sendMessage({ message: query });
  return result.text;
};
