import { z } from "zod";

export const waitlistSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name"),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email")
    .email("Please enter a valid email address"),
  hurdles: z
    .string()
    .trim()
    .min(1, "Please share your biggest hurdles in fashion"),
});

export type WaitlistFormValues = z.infer<typeof waitlistSchema>;
