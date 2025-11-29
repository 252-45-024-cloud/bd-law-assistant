import { GoogleGenAI, ChatSession, GenerateContentStreamResult } from "@google/genai";
import { MODEL_NAME, SYSTEM_INSTRUCTION } from "../constants";

let chatSession: ChatSession | null = null;
let genAI: GoogleGenAI | null = null;

export const initializeChat = async (): Promise<void> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    throw new Error("API Key not found in environment variables");
  }

  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  try {
    chatSession = genAI.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, // Lower temperature for more factual legal accuracy
        topK: 40,
        topP: 0.95,
      },
    });
  } catch (error) {
    console.error("Failed to initialize chat session:", error);
    throw error;
  }
};

export const sendMessageStream = async (message: string): Promise<GenerateContentStreamResult> => {
  if (!chatSession) {
    await initializeChat();
  }

  if (!chatSession) {
    throw new Error("Chat session could not be initialized.");
  }

  return chatSession.sendMessageStream({ message });
};

export const resetChat = () => {
  chatSession = null;
  initializeChat();
};
