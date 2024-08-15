import { createRoute, z } from "@hono/zod-openapi";
import { createApp } from "../pkg/create-app";

const uploadRoute = createRoute({
  path: "/",
  method: "get",
  responses: {
    200: {
      description: "Response",
      content: {
        "application/json": {
          schema: z.object({
            ok: z.boolean(),
          }),
        },
      },
    },
  },
});

export const route = createApp().openapi(uploadRoute, (c) => {
  return c.json({ ok: true }, 200);
});
