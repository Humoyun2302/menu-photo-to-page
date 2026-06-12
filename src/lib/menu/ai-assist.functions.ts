import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { MenuCustomTheme } from "./templates/custom-theme";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const aiStyleSchema = z.object({
  name: z.string().min(1).max(40),
  description: z.string().min(1).max(120),
  colors: z.object({
    background: hexColor,
    accent: hexColor,
    text: hexColor,
    border: hexColor,
    cardBg: hexColor,
  }),
  headerDecoration: z.enum(["none", "line", "diamond"]),
  categoryHeader: z.enum(["center", "left-rule", "accent-bar"]),
  cardRoundness: z.enum(["sharp", "rounded", "pill"]),
  fontFeel: z.enum(["serif", "sans", "bold", "light"]),
});

const STYLE_SYSTEM_PROMPT = `You design digital restaurant menu themes. Product cards are always shown in a 2-column grid.

Given a style description, return ONLY valid JSON (no markdown) matching this schema:
{
  "name": "short theme name (2-4 words)",
  "description": "one sentence vibe",
  "colors": {
    "background": "#hex page background",
    "accent": "#hex highlights and prices",
    "text": "#hex main text (must contrast background)",
    "border": "#hex card borders",
    "cardBg": "#hex card surface"
  },
  "headerDecoration": "none" | "line" | "diamond",
  "categoryHeader": "center" | "left-rule" | "accent-bar",
  "cardRoundness": "sharp" | "rounded" | "pill",
  "fontFeel": "serif" | "sans" | "bold" | "light"
}

Rules:
- All colors must be 6-digit hex with # prefix
- Ensure readable contrast between text and background
- Match the mood of the user's prompt (colors, elegance, energy, warmth)`;

function parseJsonFromModel(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(raw);
}

function mockStyleFromPrompt(prompt: string): Omit<MenuCustomTheme, "prompt"> {
  const p = prompt.toLowerCase();

  if (p.includes("neon") || p.includes("night") || p.includes("club") || p.includes("bar")) {
    return {
      name: "Neon Nights",
      description: "Electric nightlife energy with vivid accents",
      colors: {
        background: "#0a0a12",
        accent: "#ff2bd6",
        text: "#f0f0ff",
        border: "#3d2a5c",
        cardBg: "#14101f",
      },
      headerDecoration: "none",
      categoryHeader: "accent-bar",
      cardRoundness: "rounded",
      fontFeel: "bold",
    };
  }

  if (p.includes("ocean") || p.includes("sea") || p.includes("coastal") || p.includes("blue")) {
    return {
      name: "Ocean Breeze",
      description: "Fresh coastal blues with clean airy cards",
      colors: {
        background: "#eef6fb",
        accent: "#0077b6",
        text: "#1a2e3b",
        border: "#c5dce8",
        cardBg: "#ffffff",
      },
      headerDecoration: "line",
      categoryHeader: "left-rule",
      cardRoundness: "rounded",
      fontFeel: "sans",
    };
  }

  if (p.includes("forest") || p.includes("green") || p.includes("garden") || p.includes("vegan")) {
    return {
      name: "Garden Fresh",
      description: "Natural greens with organic warmth",
      colors: {
        background: "#f4f7f0",
        accent: "#3d6b35",
        text: "#1e2e1a",
        border: "#c8d4bc",
        cardBg: "#ffffff",
      },
      headerDecoration: "diamond",
      categoryHeader: "center",
      cardRoundness: "pill",
      fontFeel: "serif",
    };
  }

  if (p.includes("luxury") || p.includes("gold") || p.includes("fine dining") || p.includes("elegant")) {
    return {
      name: "Golden Hour",
      description: "Refined dark palette with gold highlights",
      colors: {
        background: "#12100e",
        accent: "#c9a962",
        text: "#f5f0e8",
        border: "#2e2a24",
        cardBg: "#1a1714",
      },
      headerDecoration: "diamond",
      categoryHeader: "center",
      cardRoundness: "sharp",
      fontFeel: "light",
    };
  }

  return {
    name: "Sunset Kitchen",
    description: "Warm terracotta tones with inviting product cards",
    colors: {
      background: "#fdf8f4",
      accent: "#d4623a",
      text: "#3d2a1f",
      border: "#e8d5c8",
      cardBg: "#ffffff",
    },
    headerDecoration: "line",
    categoryHeader: "accent-bar",
    cardRoundness: "rounded",
    fontFeel: "serif",
  };
}

export const suggestItemDescription = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      itemName: z.string().min(1),
      restaurantName: z.string().optional(),
      categoryName: z.string().optional(),
    }),
  )
  .handler(async ({ data }): Promise<{ description: string }> => {
    const rawApiKey = process.env.VITE_GEMINI_API_KEY;
    const apiKey = rawApiKey?.trim();
    const isMock = !apiKey || apiKey === "" || apiKey === "your_api_key_here";

    if (isMock) {
      return {
        description: `A delicious ${data.itemName.toLowerCase()}, crafted with fresh ingredients and served with care.`,
      };
    }

    const prompt = `Write a short, appetizing menu description (max 20 words) for "${data.itemName}"${
      data.categoryName ? ` in the "${data.categoryName}" section` : ""
    }${data.restaurantName ? ` at ${data.restaurantName}` : ""}. Return ONLY the description text, no quotes.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 80 },
      }),
    });

    if (!response.ok) {
      throw new Error("AI suggestion unavailable right now.");
    }

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!text) throw new Error("No suggestion returned.");
    return { description: text.replace(/^["']|["']$/g, "") };
  });

export const generateStyleFromPrompt = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      prompt: z.string().min(3).max(500),
      restaurantName: z.string().optional(),
    }),
  )
  .handler(async ({ data }): Promise<MenuCustomTheme> => {
    const rawApiKey = process.env.VITE_GEMINI_API_KEY;
    const apiKey = rawApiKey?.trim();
    const isMock = !apiKey || apiKey === "" || apiKey === "your_api_key_here";

    if (isMock) {
      return { ...mockStyleFromPrompt(data.prompt), prompt: data.prompt };
    }

    const userPrompt = `Restaurant: ${data.restaurantName || "My Restaurant"}
Style request: ${data.prompt}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: STYLE_SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          maxOutputTokens: 512,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      throw new Error("AI style generation unavailable right now.");
    }

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!text) throw new Error("No style returned.");

    let parsed: unknown;
    try {
      parsed = parseJsonFromModel(text);
    } catch {
      throw new Error("AI returned an invalid style. Try rephrasing your prompt.");
    }

    const result = aiStyleSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error("AI returned an invalid style. Try rephrasing your prompt.");
    }

    return { ...result.data, prompt: data.prompt };
  });
