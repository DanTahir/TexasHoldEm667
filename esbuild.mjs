import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";

const ROOT_PATH = path.dirname(url.fileURLToPath(import.meta.url));
const FRONTEND_PATH = path.join(ROOT_PATH, "frontend");
const OUT_PATH = path.join(ROOT_PATH, "backend", "static", "js");

const dev = process.env.NODE_ENV === "development";

if (fs.existsSync(OUT_PATH)) {
  fs.rmSync(OUT_PATH, { recursive: true, force: true });
}

const CONFIG = {
  entryPoints: [path.join(FRONTEND_PATH, "index.ts")],
  bundle: true,
  outdir: OUT_PATH,
  minify: !dev,
  sourcemap: dev,
  logLevel: "debug",
  target: "esnext",
};

if (dev) {
  async function watch() {
    let ctx = await esbuild.context(CONFIG);
    await ctx.watch();
    console.log("Watching...");
  }
  watch();
} else {
  await esbuild.build(CONFIG);
}
