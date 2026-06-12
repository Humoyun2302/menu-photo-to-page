import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { normalizeMenu, type MenuData } from "./menu-data";
import { loadPublishedMenu, savePublishedMenu } from "./menu-store.server";

const menuIdSchema = z
  .string()
  .min(4)
  .max(32)
  .regex(/^[a-z0-9]+$/);

const menuSchema = z.object({
  restaurantName: z.string(),
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          price: z.string(),
          imageUrl: z.string().optional(),
          tags: z.array(z.string()).optional(),
          actions: z
            .array(z.object({ label: z.string(), href: z.string().optional() }))
            .optional(),
        }),
      ),
    }),
  ),
  templateId: z.string().optional(),
  customTheme: z.record(z.unknown()).optional(),
  backgroundImageUrl: z.string().optional(),
  isDemo: z.boolean().optional(),
});

export const publishMenu = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      menuId: menuIdSchema,
      menu: menuSchema,
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const menu = normalizeMenu(data.menu as MenuData);
    await savePublishedMenu(data.menuId, menu);
    return { ok: true };
  });

export const fetchPublishedMenu = createServerFn({ method: "POST" })
  .inputValidator(z.object({ menuId: menuIdSchema }))
  .handler(async ({ data }): Promise<MenuData | null> => {
    const menu = await loadPublishedMenu(data.menuId);
    if (!menu) return null;
    return normalizeMenu(menu);
  });
