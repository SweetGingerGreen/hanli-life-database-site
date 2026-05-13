import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, "node_modules/@fontsource/noto-serif-sc/files");
const targetDir = path.join(projectRoot, "public/fonts");

const files = readdirSync(sourceDir);
const regular = files.find((file) => file.includes("-chinese-simplified-400-normal") && file.endsWith(".woff"));
const bold = files.find((file) => file.includes("-chinese-simplified-700-normal") && file.endsWith(".woff"));

if (!regular || !bold) {
  throw new Error("Could not find Noto Serif SC 400/700 WOFF files in @fontsource/noto-serif-sc.");
}

mkdirSync(targetDir, { recursive: true });
copyFileSync(path.join(sourceDir, regular), path.join(targetDir, "NotoSerifSC-Regular.woff"));
copyFileSync(path.join(sourceDir, bold), path.join(targetDir, "NotoSerifSC-Bold.woff"));

console.log("Copied Noto Serif SC fonts to public/fonts.");
