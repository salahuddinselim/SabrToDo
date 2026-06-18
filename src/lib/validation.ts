import { z } from 'zod';
import { containsInjectionPatterns } from '@/lib/utils';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be 500 characters or fewer')
    .refine((val) => !containsInjectionPatterns(val), {
      message: 'Title contains disallowed characters',
    }),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .refine((val) => !containsInjectionPatterns(val), {
      message: 'Description contains disallowed characters',
    })
    .optional()
    .default(''),
  due_date: z.string().optional().default(''),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  status: z.enum(['pending', 'completed']).optional().default('pending'),
  notify_before: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .pipe(z.number().int().min(0).max(1440))
    .optional()
    .default(15),
});

export const taskUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be 500 characters or fewer')
    .refine((val) => !containsInjectionPatterns(val), {
      message: 'Title contains disallowed characters',
    })
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .refine((val) => !containsInjectionPatterns(val), {
      message: 'Description contains disallowed characters',
    })
    .optional(),
  due_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'completed']).optional(),
  completed_at: z.string().optional(),
  notify_before: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .pipe(z.number().int().min(0).max(1440))
    .optional(),
});

export const reorderSchema = z.object({
  taskIds: z
    .array(z.string().uuid())
    .min(1, 'At least one task ID is required'),
});

export const notificationSchema = z.object({
  type: z.enum(['due_soon', 'overdue', 'completed', 'daily_summary']),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be 500 characters or fewer')
    .refine((val) => !containsInjectionPatterns(val), {
      message: 'Title contains disallowed characters',
    }),
  message: z
    .string()
    .max(2000, 'Message must be 2000 characters or fewer')
    .refine((val) => !containsInjectionPatterns(val), {
      message: 'Message contains disallowed characters',
    })
    .optional()
    .default(''),
  task_id: z.string().optional().default(''),
});

export const userSchema = z.object({
  email: z.string().email('Invalid email address').max(320),
  displayName: z
    .string()
    .max(200, 'Display name must be 200 characters or fewer')
    .refine((val) => !containsInjectionPatterns(val), {
      message: 'Display name contains disallowed characters',
    })
    .optional(),
});

export const quickAddSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be 500 characters or fewer')
    .refine((val) => !containsInjectionPatterns(val), {
      message: 'Title contains disallowed characters',
    }),
});
