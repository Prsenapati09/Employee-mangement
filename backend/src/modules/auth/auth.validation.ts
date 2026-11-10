import { z } from "zod";

export const ownerRegistrationSchema = z
  .object({
    organizationName: z.string().trim().min(2).max(120),
    organizationSlug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(12).max(128),
  })
  .strict();

export const loginSchema = z
  .object({
    organizationSlug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

export type OwnerRegistrationInput = z.infer<typeof ownerRegistrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z
  .object({
    organizationSlug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    email: z.string().trim().toLowerCase().email().max(254),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(20).max(200),
    password: z.string().min(12).max(128),
  })
  .strict();

export const acceptInvitationSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  password: z.string().min(12).max(128),
});
