import { defineConfig } from "tsup";
import {
  copyFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

const USE_CLIENT = '"use client";\n';

/**
 * tsup's idiomatic `banner: { js: '"use client";' }` is silently dropped by
 * esbuild — it warns "Module level directives cause errors when bundled" and
 * strips the directive from the output. Until esbuild (or tsup) lands a real
 * fix we re-prepend the directive in `onSuccess`; the rewritten file still
 * has the correct source map because we only add a new first line.
 */
function prependUseClient(file: string) {
  if (!existsSync(file)) return;
  const content = readFileSync(file, "utf-8");
  if (
    content.startsWith('"use client"') ||
    content.startsWith("'use client'")
  ) {
    return;
  }
  writeFileSync(file, USE_CLIENT + content);
}

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "lightweight-charts"],
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
  async onSuccess() {
    // Every component in the kit uses React state, so the package must be
    // treated as a client module by Next.js App Router consumers.
    prependUseClient("dist/index.js");
    prependUseClient("dist/index.cjs");

    if (existsSync("src/styles.css")) {
      copyFileSync("src/styles.css", "dist/styles.css");
    }
  },
});
