
import { GoogleGenAI, Type } from "@google/genai";
import { Listing, SpaceType, BookingType } from '@fiilar/types';

// Initialize Gemini Client only if API key is available
// Note: API_KEY is injected via process.env.API_KEY
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getSpaceRecommendations = async (
  userPreference: string,
  availableListings: Listing[]
): Promise<{ listingId: string; reason: string }[]> => {
  // Return empty if AI is not available
  if (!ai) {
    console.warn("Gemini API not available - skipping recommendations");
    return [];
  }

  try {
    const listingContext = availableListings
      .map((l) => `ID: ${l.id}, Title: ${l.title}, Type: ${l.type}, Tags: ${l.tags.join(", ")}, Desc: ${l.description}`)
      .join("\n");

    const prompt = `
      You are a smart recommendation engine for a space booking app called Fiilar.
      Based on the user's request: "${userPreference}"
      
      And these available listings:
      ${listingContext}
      
      Select the top 3 listings that match. 
      Return a JSON array of objects with 'listingId' and a short 'reason' why it fits.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              listingId: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ["listingId", "reason"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    return [];
  }
};

export const parseListingDescription = async (text: string): Promise<Partial<Listing>> => {
  // Return empty if AI is not available
  if (!ai) {
    console.warn("Gemini API not available - skipping description parsing");
    return {};
  }

  try {
    const prompt = `
      You are an intelligent assistant helping a host list their property on Fiilar.
      Analyze the following description text and extract the listing details.
      
      Text to analyze: "${text}"

      Instructions:
      1. Map 'type' to exactly one of: ${Object.values(SpaceType).join(", ")}.
      2. Map 'priceUnit' to exactly one of: ${Object.values(BookingType).join(", ")}.
      3. Extract specific amenities as 'tags'.
      4. Infer 'capacity' if mentioned (default to 1 if not).
      5. Clean up the title and description to be professional.
      6. Extract any house rules or safety items mentioned.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING },
            price: { type: Type.NUMBER },
            priceUnit: { type: Type.STRING },
            location: { type: Type.STRING },
            capacity: { type: Type.NUMBER },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            houseRules: { type: Type.ARRAY, items: { type: Type.STRING } },
            safetyItems: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["title", "description", "type"],
        },
      },
    });

    const textResponse = response.text;
    if (!textResponse) return {};

    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    return {};
  }
};
