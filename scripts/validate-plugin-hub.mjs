#!/usr/bin/env node
/** Validates the declarative, read-only plugin hub without installing or executing plugins. */
import { readFileSync } from "node:fs";

const pluginHub = JSON.parse(readFileSync(new URL("../config/plugin-hub.json", import.meta.url), "utf8"));
const simulations = JSON.parse(readFileSync(new URL("../config/simulation-templates.json", import.meta.url), "utf8"));

if (!Array.isArray(pluginHub.plugins) || pluginHub.plugins.length === 0) throw new Error("Plugin hub must contain at least one plugin.");
for (const plugin of pluginHub.plugins) {
  if (!plugin.id || !plugin.name || plugin.mode !== "read-only" || !/^https:\/\//.test(plugin.endpoint)) {
    throw new Error(`Invalid safe plugin definition: ${plugin.id || "unknown"}`);
  }
  if (plugin.requiresAuthorization !== true || plugin.installation !== "declarative") {
    throw new Error(`Plugin ${plugin.id} must remain authorization-gated and declarative.`);
  }
}
if (!Array.isArray(simulations.templates) || simulations.templates.some((template) => !template.approvalGate || !template.stopCriteria?.length)) {
  throw new Error("Each simulation template requires an approval gate and stop criteria.");
}
console.log(`Validated ${pluginHub.plugins.length} read-only plugins and ${simulations.templates.length} safe simulation templates.`);
