import { csrf } from "./middleware/csrf.js";
import { OpenAPIHono } from "@hono/zod-openapi";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import { timing } from "hono/timing";
import { bodyLimit } from "hono/body-limit";
import {
  badRequestError,
  contentTooLargeError,
  internalServerError,
} from "./errors/http.js";
import { init } from "./middleware/init.js";

export function createApp() {
  const app = new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        return badRequestError(c, {
          message: "Wrong data",
          errors: result.error.flatten().fieldErrors,
        });
      }
    },
  });

  app.onError((err, c) => {
    console.error(err);
    return internalServerError(c);
  });

  app.use("*", init());
  app.use("*", timing());
  app.use(
    "*",
    // @ts-expect-error
    timeout(30_000, (c) => {
      return c.json(
        {
          ok: false,
          code: "REQUEST_TIMEOUT",
          message: "Request timed out",
        },
        408
      );
    }) // 30 sec timeout
  );

  app.use("*", prettyJSON());

  app.use("*", secureHeaders());

  app.use("*", csrf());
  app.use(
    "*",
    bodyLimit({
      maxSize: 1024 * 1024 * 20,
      onError: (c) => contentTooLargeError(c),
    })
  );

  return app;
}
