import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.join(root, "web", "index.html");
const outDir = path.join(root, "dist");
const out = path.join(outDir, "index.html");

const streamlitUrl = process.env.STREAMLIT_APP_URL?.trim() || "https://share.streamlit.io";

let html = fs.readFileSync(src, "utf8");
html = html.replace(
  /const STREAMLIT_APP_URL = ".*?";/,
  `const STREAMLIT_APP_URL = ${JSON.stringify(streamlitUrl)};`,
);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(out, html, "utf8");
console.log(`Built landing page → dist/index.html (STREAMLIT_APP_URL=${streamlitUrl})`);
