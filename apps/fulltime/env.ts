import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    PORT: z.coerce
      .number(z.string({ required_error: "Port is required" }))
      .default(3000),
    DATABASE_URL: z.string({ required_error: "Database url is required" }),
    BASE_URL: z.string({ required_error: "Base url is required" }).min(1).url(),
  },

  shared: {
    ENVIRONMENT: z.enum(["development", "preview", "canary", "production"], {
      message: "Environment is required",
    }),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "VITE_PUBLIC_",
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with VITE_PUBLIC_.
   */
  client: {
    VITE_PUBLIC_API_URL: z
      .string({ required_error: "API url is required" })
      .min(1)
      .url(),
  },

  runtimeEnv: {
    PORT: process.env.PORT,
    ENVIRONMENT: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    BASE_URL: process.env.BASE_URL,
    VITE_PUBLIC_API_URL: process.env.VITE_PUBLIC_API_URL,
  },
});
