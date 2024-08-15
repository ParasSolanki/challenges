import { serveStatic } from "@hono/node-server/serve-static";
import { createApp } from "./pkg/create-app";
import { route as bannerRoutes } from "./routes/banners";

export const app = createApp()
  .get("/api/health", (c) => {
    return c.json({ ok: true, code: "OK" }, 200);
  })
  .route("/api/banners", bannerRoutes);

app.get(
  "/static/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => path.replace(/^\/static/, "/public"),
  })
);

app.get("*", serveStatic({ root: "./web/dist" }));
app.get("*", serveStatic({ root: "./web/dist/index.html" }));

export type AppType = typeof app;
