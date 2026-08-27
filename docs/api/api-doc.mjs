#!/usr/bin/env node
/**
 * Query the API docs without loading them into an AI agent's context.
 *
 * `openapi.json` and `koomeh.postman_collection.json` are ~1.7 MB together —
 * roughly 500k tokens. Reading either one whole burns most of a context window
 * and, because every request resends the conversation, keeps costing for the
 * rest of the session. This script prints the few hundred bytes you actually
 * need instead.
 *
 *   node docs/api/api-doc.mjs tags
 *   node docs/api/api-doc.mjs list "Estate Show"
 *   node docs/api/api-doc.mjs show /api/site3/estates/{id}
 *   node docs/api/api-doc.mjs show /api/site3/estates/{id}/gallery get
 *   node docs/api/api-doc.mjs schema EstateAgentDetail
 *   node docs/api/api-doc.mjs example "جزئیات ملک"
 *
 * See the "API documentation" section of AGENTS.md for the workflow.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const OPENAPI = join(HERE, "openapi.json");
const POSTMAN = join(HERE, "koomeh.postman_collection.json");

const load = (file) => JSON.parse(readFileSync(file, "utf8"));

/* ------------------------------------------------------------------ helpers */

/** Follows a local `$ref` such as `#/components/schemas/EstateAgentDetail`. */
function resolveRef(doc, ref) {
  return ref
    .replace(/^#\//, "")
    .split("/")
    .reduce((node, key) => node?.[key], doc);
}

/**
 * Prints a JSON Schema as one `path : type` line per leaf. A 63 KB response
 * schema collapses to ~3 KB this way, which is the whole point of the script.
 */
function flatten(doc, node, prefix = "", depth = 0, seen = new Set(), out = []) {
  if (!node || depth > 14) return out;

  if (node.$ref) {
    const name = node.$ref.split("/").pop();
    if (seen.has(name)) {
      out.push(`${prefix} -> ${name} (recursive)`);
      return out;
    }
    return flatten(
      doc,
      resolveRef(doc, node.$ref),
      prefix,
      depth + 1,
      new Set([...seen, name]),
      out,
    );
  }

  for (const key of ["allOf", "oneOf", "anyOf"]) {
    if (node[key]) {
      node[key].forEach((sub) => flatten(doc, sub, prefix, depth + 1, seen, out));
      return out;
    }
  }

  if (node.type === "array") {
    out.push(`${prefix} : array`);
    return flatten(doc, node.items, `${prefix}[]`, depth + 1, seen, out);
  }

  if (node.properties) {
    if (prefix) out.push(`${prefix} : object${node.nullable ? " nullable" : ""}`);
    for (const [key, value] of Object.entries(node.properties)) {
      flatten(doc, value, `${prefix}.${key}`, depth + 1, seen, out);
    }
    return out;
  }

  const bits = [node.type ?? "unknown"];
  if (node.nullable) bits.push("nullable");
  if (node.enum) bits.push(`enum=${node.enum.join("|")}`);
  if (node.example !== undefined) bits.push(`ex=${JSON.stringify(node.example)}`);
  if (!node.type && node.description) bits.push(`— ${node.description}`);
  out.push(`${prefix || "."} : ${bits.join(" ")}`);
  return out;
}

/* ------------------------------------------------------------------ commands */

function cmdTags() {
  const doc = load(OPENAPI);
  const counts = new Map();

  for (const item of Object.values(doc.paths)) {
    for (const op of Object.values(item)) {
      for (const tag of op.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
  }

  [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([tag, count]) => console.log(`${String(count).padStart(3)}  ${tag}`));
}

function cmdList(filter = "") {
  const doc = load(OPENAPI);
  const needle = filter.toLowerCase();

  for (const [path, item] of Object.entries(doc.paths)) {
    for (const [method, op] of Object.entries(item)) {
      const tags = (op.tags ?? []).join(",");
      const haystack = `${path} ${tags} ${op.summary ?? ""}`.toLowerCase();
      if (needle && !haystack.includes(needle)) continue;
      console.log(
        `${method.toUpperCase().padEnd(6)} ${path}\n       [${tags}] ${op.summary ?? ""}`,
      );
    }
  }
}

function cmdShow(path, method) {
  const doc = load(OPENAPI);
  const item = doc.paths[path];

  if (!item) {
    console.error(`No such path: ${path}`);
    console.error(`Try:  node docs/api/api-doc.mjs list ${path.split("/").pop()}`);
    process.exit(1);
  }

  const methods = method ? [method.toLowerCase()] : Object.keys(item);

  for (const verb of methods) {
    const op = item[verb];
    if (!op) continue;

    console.log(`\n### ${verb.toUpperCase()} ${path}`);
    console.log(`tags: ${(op.tags ?? []).join(", ")}`);
    if (op.summary) console.log(`summary: ${op.summary}`);
    if (op.description) console.log(`description: ${op.description}`);

    if (op.parameters?.length) {
      console.log("\nparameters:");
      for (const param of op.parameters) {
        const required = param.required ? "required" : "optional";
        console.log(
          `  ${param.name} (${param.in}, ${required}, ${param.schema?.type ?? "?"})` +
            `${param.description ? ` — ${param.description}` : ""}`,
        );
      }
    }

    const body = op.requestBody?.content?.["application/json"]?.schema;
    if (body) {
      console.log("\nrequest body:");
      flatten(doc, body).forEach((line) => console.log(`  ${line}`));
    }

    console.log("\nresponses:");
    for (const [status, response] of Object.entries(op.responses ?? {})) {
      console.log(`  ${status}: ${response.description ?? ""}`);
      const schema = response.content?.["application/json"]?.schema;
      if (schema) {
        flatten(doc, schema).forEach((line) => console.log(`    ${line}`));
      }
    }
  }
}

function cmdSchema(name) {
  const doc = load(OPENAPI);
  const schema = doc.components?.schemas?.[name];

  if (!schema) {
    console.error(`No such schema: ${name}`);
    console.error(`Available: ${Object.keys(doc.components?.schemas ?? {}).join(", ")}`);
    process.exit(1);
  }

  console.log(`### ${name}`);
  flatten(doc, schema).forEach((line) => console.log(`  ${line}`));
}

function cmdExample(filter = "") {
  const collection = load(POSTMAN);
  const needle = filter.toLowerCase();

  const walk = (items, trail) => {
    for (const entry of items ?? []) {
      const path = `${trail}/${entry.name}`;
      if (entry.item) {
        walk(entry.item, path);
        continue;
      }
      if (needle && !path.toLowerCase().includes(needle)) continue;
      for (const response of entry.response ?? []) {
        console.log(`\n##### ${path}  ::  ${response.name} [${response.code}]`);
        if (response.body) console.log(response.body);
      }
    }
  };

  walk(collection.item, "");
}

/* --------------------------------------------------------------------- main */

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case "tags":
    cmdTags();
    break;
  case "list":
    cmdList(args[0]);
    break;
  case "show":
    if (!args[0]) {
      console.error("Usage: node docs/api/api-doc.mjs show <path> [method]");
      process.exit(1);
    }
    cmdShow(args[0], args[1]);
    break;
  case "schema":
    if (!args[0]) {
      console.error("Usage: node docs/api/api-doc.mjs schema <ComponentName>");
      process.exit(1);
    }
    cmdSchema(args[0]);
    break;
  case "example":
    cmdExample(args[0]);
    break;
  default:
    console.log(
      [
        "Query the API docs without reading the raw files (~1.7 MB / ~500k tokens).",
        "",
        "  node docs/api/api-doc.mjs tags                      list every tag with its operation count",
        '  node docs/api/api-doc.mjs list "Estate Show"        list endpoints matching a tag/path/summary',
        "  node docs/api/api-doc.mjs show <path> [method]      parameters + flattened response schema",
        "  node docs/api/api-doc.mjs schema <ComponentName>    flattened component schema",
        '  node docs/api/api-doc.mjs example "جزئیات ملک"      sample responses from the Postman collection',
        "",
        "The live API is the source of truth — see AGENTS.md.",
      ].join("\n"),
    );
    process.exit(command ? 1 : 0);
}
