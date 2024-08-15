import { serve } from "@hono/node-server";
import { app } from "./app";
import { env } from "../env";

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(
      `Server is running on ${env.ENVIRONMENT === "development" ? `http://localhost:${info.port}` : env.BASE_URL}`
    );
  }
);
