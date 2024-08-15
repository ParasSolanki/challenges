import { z } from "zod";

const unixExpirationTimeSchema = z
  .number({
    required_error: "Expiration time is required",
    invalid_type_error: "Expiration time should be a number (miliseconds)",
  })
  .int({ message: "Invalid expiration time" })
  .nonnegative({ message: "Invalid expiration time" })
  .refine(
    (value) => {
      const date = new Date(value * 1000);
      return date.getTime() > 0 && date.toUTCString() !== "Invalid Date";
    },
    {
      message: "Invalid Unix timestamp",
    }
  )
  .transform((value) => new Date(value));

export const bannerBodySchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(2048, "Name can at most contain 2048 character(s)"),
  description: z
    .string()
    .max(5000, "Description can at most contain 5000 character(s)")
    .nullable(),
  expiresAt: z.date({ required_error: "Expiration time is required" }),
  isActive: z.boolean({ required_error: "Is active is required" }),
});

export const bannerPayloadSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(2048, "Name can at most contain 2048 character(s)"),
  description: z
    .string()
    .max(5000, "Description can at most contain 5000 character(s)")
    .nullable(),
  expiresAt: unixExpirationTimeSchema,
  isActive: z.boolean({ required_error: "Is active is required" }),
});

export const successSchema = z.object({
  ok: z.boolean(),
  code: z.literal("OK"),
});

export const bannerSchema = z.object({
  id: z.string(),
  name: z.string(),
  expiresAt: z.number(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
});

export const bannerResponseSchema = successSchema.extend({
  data: z.object({
    banner: bannerSchema,
  }),
});

export const getBannersResponseSchema = successSchema.extend({
  data: z.object({
    banners: bannerSchema.array(),
  }),
});
