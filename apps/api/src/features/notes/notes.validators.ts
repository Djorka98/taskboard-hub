import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  color: z.string().optional(),
  label: z.string().optional(),
  pinned: z.boolean().default(false),
});

export const updateNoteSchema = createNoteSchema.partial();
