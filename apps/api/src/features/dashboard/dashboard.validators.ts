import { z } from 'zod';

export const widgetLayoutItemSchema = z.object({
  widgetId: z.string().min(1),
  order: z.number().int().nonnegative(),
  visible: z.boolean().default(true),
  width: z.number().int().min(1).max(12).default(4),
  height: z.number().int().min(1).max(12).default(3),
});

export const updateLayoutSchema = z.object({
  items: z.array(widgetLayoutItemSchema),
});
