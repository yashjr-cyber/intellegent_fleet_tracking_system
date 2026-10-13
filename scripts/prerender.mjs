import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createServer } from "vite";

const root = process.cwd();
const server = await createServer({
  configFile: resolve(root, "vite.config.ts"),
  appType: "custom",
  server: { middlewareMode: true },
});

try {
  const { PublicLandingPage } = await server.ssrLoadModule("/src/pages/PublicLandingPage.tsx");
  const landingMarkup = renderToStaticMarkup(createElement(PublicLandingPage));
  const htmlPath = resolve(root, "dist/index.html");
  const html = await readFile(htmlPath, "utf8");
  const rootElement = '<div id="root"></div>';

  if (!html.includes(rootElement)) {
    throw new Error("Could not find the application root in dist/index.html");
  }

  await writeFile(htmlPath, html.replace(rootElement, `<div id="root">${landingMarkup}</div>`));
} finally {
  await server.close();
}
