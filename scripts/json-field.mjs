#!/usr/bin/env node
/**
 * Minimal JSON inspector for the deployment scripts. It intentionally avoids third-party packages.
 * Usage: command-producing-json | node scripts/json-field.mjs --field result.id
 */
import { stdin, argv, exit } from "node:process";

const argumentIndex = argv.indexOf("--field");
const field = argumentIndex === -1 ? "" : argv[argumentIndex + 1];

if (!field) {
  console.error("Usage: json-field.mjs --field <dot.path>");
  exit(64);
}

let raw = "";
stdin.setEncoding("utf8");
stdin.on("data", (chunk) => { raw += chunk; });
stdin.on("end", () => {
  try {
    const payload = JSON.parse(raw);
    if (payload.success === false) {
      const errors = Array.isArray(payload.errors) ? payload.errors.map((item) => item.message).join("; ") : "Cloudflare API request failed";
      console.error(errors);
      exit(1);
    }
    const value = field.split(".").reduce((current, key) => current?.[key], payload);
    if (value === undefined || value === null || value === "") {
      console.error(`Missing JSON field: ${field}`);
      exit(1);
    }
    process.stdout.write(typeof value === "string" ? value : JSON.stringify(value));
  } catch (error) {
    console.error(`Invalid JSON response: ${error instanceof Error ? error.message : "unknown error"}`);
    exit(1);
  }
});
