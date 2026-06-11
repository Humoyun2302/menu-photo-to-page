import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { ExtractedMenu } from "./menu-data";

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

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

const EXTRACTION_PROMPT = `Extract the complete menu from this photo of a restaurant menu.

Return JSON with EXACTLY this shape:
{"restaurantName": string, "categories": [{"name": string, "items": [{"name": string, "description": string, "price": string}]}]}

Rules:
- Include every item you can read, grouped under their printed section headings (e.g. Starters, Mains, Desserts). If there are no headings, use a single category named "Menu".
- Keep prices exactly as printed, including the currency symbol (e.g. "$12.50", "9€"). Use "" if no price is shown.
- Use "" for items without a description. Never invent dishes, descriptions, or prices.
- If the restaurant name is not visible, use "My Restaurant".
- Respond with raw JSON only — no markdown, no commentary.`;

export const extractMenu = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      imageDataUrl: z
        .string()
        .regex(/^data:image\/(png|jpe?g|webp);base64,/, "Expected a JPG, PNG or WEBP image"),
    }),
  )
  .handler(async ({ data }): Promise<ExtractedMenu> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured for this project.");

    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an expert at reading photographs of restaurant menus and transcribing them with perfect accuracy. You always respond with valid JSON only.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: EXTRACTION_PROMPT },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (response.status === 429) {
      throw new Error("The AI is a bit busy right now. Please try again in a moment.");
    }
    if (response.status === 402) {
      throw new Error("AI credits are exhausted. Please add credits to your workspace.");
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("AI gateway error", response.status, body);
      throw new Error("Couldn't read the menu photo. Please try again.");
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    let text = payload.choices?.[0]?.message?.content ?? "";
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
