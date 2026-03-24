#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const TOKEN_ENV = "FIGMA_ACCESS_TOKEN";

function main() {
  const args = process.argv.slice(2);
  let projectRoot = ".";
  let file = ".env.local";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--project-root" && i + 1 < args.length) projectRoot = args[++i];
    else if (args[i] === "--file" && i + 1 < args.length) file = args[++i];
  }

  const root = path.resolve(projectRoot);
  const envFile = path.join(root, file);
  fs.mkdirSync(path.dirname(envFile), { recursive: true });

  let text = "";
  if (fs.existsSync(envFile)) {
    text = fs.readFileSync(envFile, "utf-8");
  }
  if (text.includes(TOKEN_ENV)) {
    console.log(`${envFile} already contains ${TOKEN_ENV}`);
    return 0;
  }
  const block = `\n# Figma API\n${TOKEN_ENV}=<your_figma_personal_access_token>\n`;
  fs.writeFileSync(envFile, text.trimEnd() + block + "\n", "utf-8");
  console.log(`Created config at: ${envFile}`);
  console.log("Next step: replace <your_figma_personal_access_token> with real token");
  return 0;
}

process.exit(main());
