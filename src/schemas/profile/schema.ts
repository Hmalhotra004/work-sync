import { user } from "@/db/schema";
import { createUpdateSchema } from "drizzle-zod";
import z from "zod";

export const userIdSchema = z.object({
  id: z.string().trim().min(1, { error: "User ID is required" }),
});

export const updateUserSchema = createUpdateSchema(user)
  .omit({
    createdAt: true,
    updatedAt: true,
    emailVerified: true,
    email: true,
  })
  .extend({
    id: z.string().trim().min(1, { error: "User ID is required" }),
    name: z
      .string()
      .trim()
      .min(1, { error: "User name is required" })
      .optional(),
    image: z.url().trim().optional(),
  });
