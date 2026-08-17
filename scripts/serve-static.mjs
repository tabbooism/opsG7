#!/usr/bin/env node
/**
 * Dependency-free static server used by the Cloudflare Tunnel workflow.
 * It binds to localhost by default so the app is reachable only through the tunnel.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve, extname, normalize, sep } from "node:path";
import { createServer } from "node:http";

const root = resolve(process.cwd(), "dist");
const args = process.argv.slice(2);
const portArgument = args.indexOf("--port");
const hostArgument = args.indexOf("--host");
const port = Number(portArgument >= 0 ? args[portArgument + 1] : process.env.PORT || 8080);
const host = hostArgument >= 0 ? args[hostArgument + 1] : process.env.HOST || "127.0.0.1";

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("Port must be an integer between 1 and 65535.");
}
if (!existsSync(root) || !statSync(root).isDirectory()) {
  throw new Error("Missing dist/ directory. Run `pnpm run build` before serving production files.");
}

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function safeFile(pathname) {
  const requested = decodeURIComponent(pathname.split("?")[0]);
  const relative = normalize(requested).replace(/^([/\\])+/, "");
  const candidate = resolve(root, relative || "index.html");
  return candidate.startsWith(`${root}${sep}`) || candidate === root ? candidate : null;
}

const server = createServer((request, response) => {
  const requestedPath = safeFile(request.url || "/");
  const assetPath = requestedPath && existsSync(requestedPath) && statSync(requestedPath).isFile()
    ? requestedPath
    : resolve(root, "index.html");
  response.setHeader("Cache-Control", assetPath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable");
  response.setHeader("Content-Security-Policy", "default-src 'self'; connect-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; base-uri 'self'; frame-ancestors 'none'");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.writeHead(200, { "Content-Type": types[extname(assetPath)] || "application/octet-stream" });
  createReadStream(assetPath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Signal Archive static server listening on http://${host}:${port}`);
});
