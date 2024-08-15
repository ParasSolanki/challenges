import { serveStatic } from "@hono/node-server/serve-static";
import { createApp } from "./pkg/create-app";
import {
  createIPX,
  createIPXWebServer,
  ipxFSStorage,
  ipxHttpStorage,
} from "ipx";
import { route as uploadRoutes } from "./routes/uploads";

const ipx = createIPX({
  storage: ipxFSStorage({ dir: "./public" }),
  httpStorage: ipxHttpStorage({ allowAllDomains: true }),
});

export const app = createApp().route("/api/uploads", uploadRoutes);

app.use("/_ipx/*", (c) =>
  createIPXWebServer(ipx)(new Request(c.req.raw.url.replace(/^\/_ipx/, "")))
);
app.get(
  "/static/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => path.replace(/^\/static/, "/public"),
  })
);

app.use("*", serveStatic({ root: "./web/dist" }));
app.get("*", serveStatic({ root: "./web/dist/index.html" }));

export type AppType = typeof app;
