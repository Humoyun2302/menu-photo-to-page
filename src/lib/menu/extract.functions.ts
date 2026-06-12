import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { ExtractedMenu } from "./menu-data";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const rawItemSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  price: z.union([z.string(), z.number()]).nullish(),
});

const rawMenuSchema = z.object({
  restaurantName: z.string().nullish(),
  categories: z
    .array(
      z.object({
        name: z.string().nullish(),
        items: z.array(rawItemSchema).default([]),
      }),
    )
    .default([]),
});

const SYSTEM_PROMPT = `You are a menu digitizer. Extract all items from this restaurant menu photo. Return ONLY valid JSON in this exact format, no markdown, no explanation: { "restaurantName": "...", "categories": [{ "name": "...", "items": [{ "name": "...", "description": "...", "price": "..." }] }] }`;

/**
 * Parse a data-URL into the mimeType and raw base64 payload that the
 * Gemini vision API expects.
 */
function parseDataUrl(dataUrl: string): { mimeType: string; base64Data: string } {
  const match = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/s);
  if (!match) throw new Error("Invalid image data URL");
  return { mimeType: match[1], base64Data: match[2] };
}

const MOCK_MENU: ExtractedMenu = {
  isDemo: true,
  restaurantName: "Matcha Club",
  categories: [
    {
      name: "Breakfasts (Завтраки)",
      items: [
        {
          name: "Oatmeal with fresh berries",
          description: "Oatmeal, coconut milk, seasonal berries, honey, chia seeds",
          price: "90.00",
        },
        {
          name: "Grechka with mushrooms & poached egg",
          description: "Buckwheat, wild mushrooms, spinach, poached egg, parmesan",
          price: "110.00",
        },
        {
          name: "Scramble with avocado",
          description: "Scrambled eggs, fresh avocado, sourdough toast, mixed greens",
          price: "140.00",
        },
      ],
    },
    {
      name: "Poke & Bowls (Поке и Боулы)",
      items: [
        {
          name: "Poke Bowl with Salmon",
          description: "Salmon, sushi rice, edamame, cucumber, avocado, spicy mayo",
          price: "145.00",
        },
        {
          name: "Green Vegan Bowl",
          description: "Quinoa, broccoli, avocado, spinach, cucumber, green dressing",
          price: "120.00",
        },
      ],
    },
    {
      name: "Drinks & Desserts (Напитки и Десерты)",
      items: [
        {
          name: "Matcha Latte",
          description: "Ceremonial grade matcha with oat milk",
          price: "70.00",
        },
        {
          name: "San Sebastian Cheesecake",
          description: "Creamy Basque cheesecake with a burnt top",
          price: "80.00",
        },
      ],
    },
  ],
};

export const extractMenu = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      imageDataUrl: z
        .string()
        .regex(/^data:image\/(png|jpe?g|webp);base64,/, "Expected a JPG, PNG or WEBP image"),
    }),
  )
  .handler(async ({ data }): Promise<ExtractedMenu> => {
    const rawApiKey = process.env.VITE_GEMINI_API_KEY;
    const apiKey = rawApiKey ? rawApiKey.trim() : undefined;
    const isMock = !apiKey || apiKey === "" || apiKey === "your_api_key_here";

    if (isMock) {
      console.warn("Using mock fallback menu because VITE_GEMINI_API_KEY is not configured.");
      return MOCK_MENU;
    }

    const { mimeType, base64Data } = parseDataUrl(data.imageDataUrl);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              {
                text: "Extract the full menu from this photo.",
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 4096,
        },
      }),
    });

    if (response.status === 429) {
      throw new Error("The AI is a bit busy right now. Please try again in a moment.");
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("Gemini API error", response.status, body);
      if (response.status === 400 || response.status === 403) {
        if (body.includes("API key not valid") || body.includes("API_KEY_INVALID")) {
          throw new Error("Invalid Gemini API key. Check VITE_GEMINI_API_KEY in your .env file.");
        }
        throw new Error(`Gemini API Error (${response.status}): ${body}`);
      }
      throw new Error("Couldn't read the menu photo. Please try again.");
    }

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    // Gemini returns candidates → content → parts — grab the first text part
    let text = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    text = text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("AI returned non-JSON output:", text.slice(0, 400));
      throw new Error("The AI couldn't structure this menu. Try a clearer, well-lit photo.");
    }

    const result = rawMenuSchema.safeParse(parsed);
    if (!result.success) {
      console.error("AI output failed validation:", result.error.message);
      throw new Error("The AI couldn't structure this menu. Try a clearer, well-lit photo.");
    }

    const categories = result.data.categories
      .map((category) => ({
        name: (category.name ?? "Menu").trim() || "Menu",
        items: category.items
          .filter((item) => item.name.trim().length > 0)
          .map((item) => ({
            name: item.name.trim(),
            description: (item.description ?? "").trim(),
            price: item.price == null ? "" : String(item.price).trim(),
          })),
      }))
      .filter((category) => category.items.length > 0);

    if (categories.length === 0) {
      throw new Error("No menu items were found in that photo. Try a clearer shot of the menu.");
    }

    return {
      restaurantName: (result.data.restaurantName ?? "").trim() || "My Restaurant",
      categories,
    };
  });
