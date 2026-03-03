import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'blocked', 'completed']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  assigneeId: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();
