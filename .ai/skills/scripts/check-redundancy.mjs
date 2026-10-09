#!/usr/bin/env node
// Evaluación de fusiones antirredundancia entre skills del canon trifásico.
// Falla (exit 1) ante: id duplicado, colisión de (area,fase) o solapamiento de alcance.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const areas = ["proteccion", "accesibilidad", "orden"];
const manifests = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (entry === "skill.json") manifests.push(p);
  }
}
for (const a of areas) {
  try {
    walk(join(root, a));
  } catch {
    /* área aún no forjada */
  }
}

const skills = manifests.map((p) => ({ p, m: JSON.parse(readFileSync(p, "utf8")) }));
const errors = [];

// 1. ids únicos
const ids = new Map();
for (const { p, m } of skills) {
  if (ids.has(m.id)) errors.push(`ID duplicado '${m.id}': ${p} ↔ ${ids.get(m.id)}`);
  ids.set(m.id, p);
}

// 2. un único skill por (area, fase)
const slots = new Map();
for (const { p, m } of skills) {
  const key = `${m.area}/${m.phase.slug}`;
  if (slots.has(key)) errors.push(`Colisión de fase '${key}': ${p} ↔ ${slots.get(key)}`);
  slots.set(key, p);
}

// 3. solapamiento de alcance (Jaccard de keywords)
const jaccard = (a, b) => {
  const A = new Set(a);
  const B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union === 0 ? 0 : inter / union;
};
for (let i = 0; i < skills.length; i++) {
  for (let j = i + 1; j < skills.length; j++) {
    const a = skills[i].m;
    const b = skills[j].m;
    const sim = jaccard(a.antiRedundancy.keywords, b.antiRedundancy.keywords);
    const declared =
      (a.antiRedundancy.mergeableWith || []).includes(b.id) ||
      (b.antiRedundancy.mergeableWith || []).includes(a.id);
    if (sim >= 0.6 && !declared) {
      errors.push(
        `Redundancia (Jaccard ${sim.toFixed(2)}) entre '${a.id}' y '${b.id}'. ` +
          `Diferencia el alcance o declara 'mergeableWith'.`,
      );
    }
  }
}

if (errors.length) {
  console.error("\u2717 Evaluación antirredundancia FALLIDA:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`\u2713 ${skills.length} skills · sin colisiones de id, fase ni alcance.`);
