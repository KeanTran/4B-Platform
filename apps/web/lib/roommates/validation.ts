import { z } from 'zod';

const optionalTrimmedText = (max: number) =>
  z.string().trim().max(max).optional().nullable();

export const roommateProfileSchema = z
  .object({
    display_name: z.string().trim().min(2).max(80),
    birth_year: z.number().int().min(1940).max(2100).optional().nullable(),
    occupation: optionalTrimmedText(120),
    city: z.string().trim().min(2).max(100),
    district: z.string().trim().min(2).max(100),
    budget_min: z.number().int().min(0),
    budget_max: z.number().int().min(0),
    move_in_date: z.string().date().optional().nullable(),
    bio: z.string().trim().max(1000).default(''),
    habits: z.array(z.string().trim().min(1).max(50)).max(12).default([]),
    gender: z.enum(['female', 'male', 'other', 'prefer_not_to_say']).default('prefer_not_to_say'),
    preferred_gender: z.enum(['female', 'male', 'other', 'any']).default('any'),
    smoking: z.boolean().default(false),
    has_pets: z.boolean().default(false),
    avatar_url: z.string().url().max(1000).optional().nullable(),
    is_discoverable: z.boolean().default(false),
  })
  .refine((value) => value.budget_max >= value.budget_min, {
    message: 'Ngân sách tối đa phải lớn hơn hoặc bằng ngân sách tối thiểu.',
    path: ['budget_max'],
  });

export const roommatePostSchema = z
  .object({
    title: z.string().trim().min(8).max(160),
    content: z.string().trim().min(20).max(3000),
    city: z.string().trim().min(2).max(100),
    district: z.string().trim().min(2).max(100),
    budget_min: z.number().int().min(0),
    budget_max: z.number().int().min(0),
    move_in_date: z.string().date().optional().nullable(),
    tags: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
  })
  .refine((value) => value.budget_max >= value.budget_min, {
    message: 'Ngân sách tối đa phải lớn hơn hoặc bằng ngân sách tối thiểu.',
    path: ['budget_max'],
  });

export const roommateBookmarkSchema = z.object({
  target: z.enum(['profile', 'post']),
  target_id: z.string().uuid(),
});

export const roommateConnectionCreateSchema = z.object({
  profile_id: z.string().uuid(),
  message: z.string().trim().max(500).default(''),
});

export const roommateConnectionActionSchema = z.object({
  connection_id: z.string().uuid(),
  action: z.enum(['accept', 'decline', 'cancel', 'disconnect']),
});
