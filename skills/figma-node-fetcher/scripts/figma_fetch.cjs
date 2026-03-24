#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { URL, URLSearchParams } = require("url");

const API_BASE = "https://api.figma.com/v1";
const TOKEN_ENV = "FIGMA_ACCESS_TOKEN";

function findToken(projectRoot) {
  const envToken = (process.env[TOKEN_ENV] || "").trim();
  if (envToken) {
    return { configured: true, source: "environment", token_preview: maskToken(envToken), token: envToken };
  }
  const envFiles = [".env", ".env.local", ".figma.env"];
  for (const name of envFiles) {
    const p = path.join(projectRoot, name);
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, "utf-8");
    const re = new RegExp(`^\\s*${TOKEN_ENV}\\s*=\\s*(.+?)\\s*$`, "m");
    const m = content.match(re);
    if (m) {
      const token = m[1].trim().replace(/^["']|["']$/g, "");
      if (token) {
        return { configured: true, source: p, token_preview: maskToken(token), token };
      }
    }
  }
  return {
    configured: false,
    source: null,
    setup_guide: {
      recommended_file: path.join(projectRoot, ".env.local"),
      line: `${TOKEN_ENV}=<your_figma_personal_access_token>`
    }
  };
}

function maskToken(token) {
  if (token.length <= 8) return "*".repeat(token.length);
  return token.slice(0, 4) + "*".repeat(token.length - 8) + token.slice(-4);
}

function parseFigmaUrl(rawUrl) {
  const parsed = new URL(rawUrl);
  const nodeRaw = parsed.searchParams.get("node-id") || "";
  if (!nodeRaw) throw new Error("Figma URL must contain query parameter node-id");
  const nodeId = decodeURIComponent(nodeRaw);
  const parts = parsed.pathname.split("/").filter(Boolean);
  let fileKey = null;
  if (parts.length >= 3 && (parts[0] === "file" || parts[0] === "design")) {
    fileKey = parts[1];
  }
  if (!fileKey) throw new Error("Cannot parse file key from Figma URL");
  return { file_key: fileKey, node_id: nodeId, host: parsed.host, path: parsed.pathname };
}

function apiGetJson(url, token) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { headers: { "X-Figma-Token": token }, timeout: 30000 }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf-8");
        try { resolve(JSON.parse(body)); } catch (e) { reject(new Error(`Invalid JSON: ${body.slice(0, 200)}`)); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timed out")); });
  });
}

function httpGetBinary(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const doGet = (u) => {
      mod.get(u, { timeout: 60000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const rMod = res.headers.location.startsWith("https") ? https : http;
          rMod.get(res.headers.location, { timeout: 60000 }, (res2) => {
            const chunks = [];
            res2.on("data", (c) => chunks.push(c));
            res2.on("end", () => resolve(Buffer.concat(chunks)));
          }).on("error", reject);
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      }).on("error", reject);
    };
    doGet(url);
  });
}

function fetchNode(fileKey, nodeId, token, depth) {
  const qs = new URLSearchParams({ ids: nodeId, depth: String(depth) });
  const url = `${API_BASE}/files/${fileKey}/nodes?${qs}`;
  return apiGetJson(url, token);
}

async function fetchImage(fileKey, nodeId, token, fmt, scale) {
  const qs = new URLSearchParams({ ids: nodeId, format: fmt, scale: String(scale) });
  const meta = await apiGetJson(`${API_BASE}/images/${fileKey}?${qs}`, token);
  const imageUrl = ((meta.images || {})[nodeId] || "").trim();
  if (!imageUrl) throw new Error("No image URL returned by Figma API for node");
  const binary = await httpGetBinary(imageUrl);
  return { meta, binary };
}

function safeNodeName(nodeId) {
  return nodeId.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-|-$/g, "") || "node";
}

function readUrlsFromFile(filePath) {
  const p = path.resolve(filePath);
  const lines = fs.readFileSync(p, "utf-8").split(/\r?\n/);
  return lines.map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
}

function writeNodeOutput(outDir, figma, data) {
  const nodeName = safeNodeName(figma.node_id);
  const nodeDir = path.join(outDir, nodeName);
  fs.mkdirSync(nodeDir, { recursive: true });
  const outJson = path.join(nodeDir, "node.json");
  fs.writeFileSync(outJson, JSON.stringify(data, null, 2), "utf-8");
  return { node_id: figma.node_id, node_json: outJson };
}

function writeImageOutput(outDir, figma, data, fmt) {
  const nodeName = safeNodeName(figma.node_id);
  const nodeDir = path.join(outDir, nodeName);
  fs.mkdirSync(nodeDir, { recursive: true });
  const ext = fmt === "png" ? "png" : fmt;
  const outImg = path.join(nodeDir, `node.${ext}`);
  fs.writeFileSync(outImg, data.binary);
  const outMeta = path.join(nodeDir, "image-meta.json");
  fs.writeFileSync(outMeta, JSON.stringify(data.meta, null, 2), "utf-8");
  return { node_id: figma.node_id, image: outImg, meta_json: outMeta };
}

function cmdCheckConfig(opts) {
  const root = path.resolve(opts.projectRoot || ".");
  const cfg = findToken(root);
  const out = { ...cfg };
  delete out.token;
  console.log(JSON.stringify({ ok: true, mode: "check-config", config: out }, null, 2));
  return 0;
}

function cmdValidateLink(opts) {
  const info = parseFigmaUrl(opts.url);
  console.log(JSON.stringify({ ok: true, mode: "validate-link", figma: info }, null, 2));
  return 0;
}

async function cmdFetch(opts) {
  const root = path.resolve(opts.projectRoot || ".");
  const cfg = findToken(root);
  const token = (process.env[TOKEN_ENV] || "").trim() || cfg.token || "";
  if (!token) {
    const out = { ...cfg };
    delete out.token;
    console.log(JSON.stringify({ ok: false, error: "missing_token", config: out }, null, 2));
    return 2;
  }
  const figma = parseFigmaUrl(opts.url);
  const outDir = path.resolve(opts.outputDir);
  fs.mkdirSync(outDir, { recursive: true });

  if (opts.type === "node") {
    const data = await fetchNode(figma.file_key, figma.node_id, token, opts.depth);
    const item = writeNodeOutput(outDir, figma, data);
    console.log(JSON.stringify({
      ok: true, mode: "fetch", type: "node", figma, output: { node_json: item.node_json }
    }, null, 2));
    return 0;
  }
  const data = await fetchImage(figma.file_key, figma.node_id, token, opts.format, opts.scale);
  const item = writeImageOutput(outDir, figma, data, opts.format);
  console.log(JSON.stringify({
    ok: true, mode: "fetch", type: "image", figma, output: { image: item.image, meta_json: item.meta_json }
  }, null, 2));
  return 0;
}

async function cmdFetchBatch(opts) {
  const root = path.resolve(opts.projectRoot || ".");
  const cfg = findToken(root);
  const token = (process.env[TOKEN_ENV] || "").trim() || cfg.token || "";
  if (!token) {
    const out = { ...cfg };
    delete out.token;
    console.log(JSON.stringify({ ok: false, error: "missing_token", config: out }, null, 2));
    return 2;
  }

  const urls = [...(opts.url || [])];
  if (opts.urlsFile) urls.push(...readUrlsFromFile(opts.urlsFile));
  if (!urls.length) {
    console.log(JSON.stringify({ ok: false, error: "no_urls", message: "Provide --url or --urls-file" }, null, 2));
    return 2;
  }

  const outDir = path.resolve(opts.outputDir);
  if (fs.existsSync(outDir) && opts.cleanOutput) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  const items = [];
  const failures = [];
  for (const rawUrl of urls) {
    try {
      const figma = parseFigmaUrl(rawUrl);
      let item;
      if (opts.type === "node") {
        const data = await fetchNode(figma.file_key, figma.node_id, token, opts.depth);
        item = writeNodeOutput(outDir, figma, data);
      } else {
        const data = await fetchImage(figma.file_key, figma.node_id, token, opts.format, opts.scale);
        item = writeImageOutput(outDir, figma, data, opts.format);
      }
      item.url = rawUrl;
      items.push(item);
    } catch (e) {
      failures.push({ url: rawUrl, error: e.message || String(e) });
    }
  }

  const summary = {
    ok: items.length > 0 && failures.length === 0,
    mode: "fetch-batch",
    type: opts.type,
    success_count: items.length,
    failure_count: failures.length,
    output_dir: outDir,
    items,
    failures
  };
  console.log(JSON.stringify(summary, null, 2));
  return failures.length ? 1 : 0;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const cmd = args[0];
  const opts = { url: [] };
  let i = 1;
  while (i < args.length) {
    const a = args[i];
    if (a === "--project-root" && i + 1 < args.length) { opts.projectRoot = args[++i]; }
    else if (a === "--url" && i + 1 < args.length) { opts.url.push(args[++i]); }
    else if (a === "--urls-file" && i + 1 < args.length) { opts.urlsFile = args[++i]; }
    else if (a === "--type" && i + 1 < args.length) { opts.type = args[++i]; }
    else if (a === "--output-dir" && i + 1 < args.length) { opts.outputDir = args[++i]; }
    else if (a === "--depth" && i + 1 < args.length) { opts.depth = parseInt(args[++i], 10); }
    else if (a === "--format" && i + 1 < args.length) { opts.format = args[++i]; }
    else if (a === "--scale" && i + 1 < args.length) { opts.scale = parseFloat(args[++i]); }
    else if (a === "--clean-output") { opts.cleanOutput = true; }
    i++;
  }
  if (opts.depth === undefined || isNaN(opts.depth)) opts.depth = 2;
  if (!opts.format) opts.format = "png";
  if (opts.scale === undefined || isNaN(opts.scale)) opts.scale = 2.0;
  if (opts.url.length === 1 && cmd !== "fetch-batch") {
    const single = opts.url[0];
    opts.url = single;
  }
  return { cmd, opts };
}

async function main() {
  const { cmd, opts } = parseArgs(process.argv);
  try {
    switch (cmd) {
      case "check-config": return cmdCheckConfig(opts);
      case "validate-link": return cmdValidateLink(opts);
      case "fetch": return await cmdFetch(opts);
      case "fetch-batch": return await cmdFetchBatch(opts);
      default:
        console.log(JSON.stringify({ ok: false, error: `Unknown command: ${cmd}. Use: check-config, validate-link, fetch, fetch-batch` }, null, 2));
        return 1;
    }
  } catch (e) {
    console.log(JSON.stringify({ ok: false, error: e.message || String(e) }, null, 2));
    return 1;
  }
}

main().then((code) => process.exit(code));
