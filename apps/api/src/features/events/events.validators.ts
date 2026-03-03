import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  category: z.string().min(1),
  reminderMinutes: z.number().int().positive().optional(),
});

export const updateEventSchema = createEventSchema.partial();
