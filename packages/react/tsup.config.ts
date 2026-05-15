import { defineConfig } from "tsup";
import { copyFileSync, existsSync } from "node:fs";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom"],
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
  async onSuccess() {
    if (existsSync("src/styles.css")) {
      copyFileSync("src/styles.css", "dist/styles.css");
    }
  },
});
