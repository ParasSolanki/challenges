import { build } from "esbuild";

build({
  entryPoints: ["./api/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20.16.0",
  outdir: "./dist",
  banner: {
    js: "import { createRequire as topLevelCreateRequire } from 'module';\n const require = topLevelCreateRequire(import.meta.url);",
  },
});
