/**
 * One-shot migration: fold amra-world codex content into amra-app lore.
 *
 * Reads /Users/eridia/Projects/amra-world/public/codex/*.md (YAML frontmatter
 * + markdown body), classifies entries by `category`, and rewrites the
 * corresponding lore/*.md file by either updating existing sub-entries
 * (matched by slug) or appending new ones. Hero webp images are copied from
 * /art/codex/<slug>.webp to /assets/heroes/sub/<chapterId>/<slug>.webp.
 *
 * Usage:
 *   tsx scripts/codex-migrate.ts                       (all categories, write)
 *   tsx scripts/codex-migrate.ts --dry-run             (no writes; print diff)
 *   tsx scripts/codex-migrate.ts --category=gods       (one category only)
 *   tsx scripts/codex-migrate.ts --source=/abs/path    (override codex root)
 *
 * The chapter overview block (block 0 of each lore file) is never touched.
 * Region migration (codex regions → gazetteer overviews + extracted houses)
 * is not yet implemented and prints a NOTE when encountered.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, copyFileSync, unlinkSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import matter from "gray-matter";

const APP_ROOT = join(__dirname, "..");
const DEFAULT_CODEX_ROOT = "/Users/eridia/Projects/amra-world";

type Category = "gods" | "factions" | "history" | "species" | "magic" | "cosmology" | "regions";

const CATEGORY_TO_CHAPTER: Record<
  Exclude<Category, "regions">,
  { file: string; chapterId: string; hubSlug?: string }
> = {
  history: { file: "lore/2_history_of_amra.md", chapterId: "history-of-amra", hubSlug: "history-of-amra" },
  species: { file: "lore/3_races.md", chapterId: "races" },
  magic: { file: "lore/4_magic.md", chapterId: "magic", hubSlug: "magic-in-amra" },
  cosmology: { file: "lore/6_cosmology.md", chapterId: "cosmology", hubSlug: "cosmology-of-amra" },
  gods: { file: "lore/5_religions.md", chapterId: "religions" },
  factions: { file: "lore/7_factions.md", chapterId: "factions" },
};

const ALL_CATEGORIES: Category[] = ["gods", "factions", "history", "species", "magic", "cosmology", "regions"];

// ---------- args ----------

type Args = {
  dryRun: boolean;
  categories: Category[];
  source: string;
  forceRegionHeroes: boolean;
  align: boolean;
};

function parseArgs(argv: string[]): Args {
  const out: Args = {
    dryRun: false,
    categories: ALL_CATEGORIES.slice(),
    source: DEFAULT_CODEX_ROOT,
    forceRegionHeroes: false,
    align: false,
  };
  for (const a of argv) {
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--force-region-heroes") out.forceRegionHeroes = true;
    else if (a === "--align") out.align = true;
    else if (a.startsWith("--category=")) {
      const v = a.slice("--category=".length).trim();
      if (!ALL_CATEGORIES.includes(v as Category)) {
        throw new Error(`unknown category: ${v}. valid: ${ALL_CATEGORIES.join(", ")}`);
      }
      out.categories = [v as Category];
    } else if (a.startsWith("--source=")) {
      out.source = a.slice("--source=".length).trim();
    }
  }
  return out;
}

// ---------- slug ----------

function slug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^the-/, "");
}

// Explicit aliases for cases where codex slug and existing title diverge too
// much for the fuzzy matcher (suffix stripping) to reconnect. Keyed by the
// codex slug; value is the slug of the existing title in lore/.
const SLUG_ALIASES: Record<string, string> = {
  // history
  "age-of-dragons": "creation-of-the-dragons",
  "age-of-humans": "creation-of-the-humans",
  "birth-of-the-elder-gods": "creation-of-the-gods",
  "dragons-revelation": "return-of-the-dragons",
  "dwarven-foundings": "saga-of-the-dwarves",
  "hundred-nights-capitulations": "capitulations-of-the-hundred-nights",
  "present-age-of-amra": "present-time",
};

function matchExisting(codexSlug: string, existing: Map<string, number>): number | undefined {
  if (existing.has(codexSlug)) return existing.get(codexSlug);
  const aliased = SLUG_ALIASES[codexSlug];
  if (aliased && existing.has(aliased)) return existing.get(aliased);
  // Strip "-of-amra" / "-in-amra" suffix and retry.
  const stripped = codexSlug.replace(/-(of|in)-amra$/, "");
  if (stripped !== codexSlug && existing.has(stripped)) return existing.get(stripped);
  return undefined;
}

// ---------- block parse/serialize (matches scripts/lore-build.ts parser) ----------

type Block = Record<string, string>;

const KEY_LINE = /^([a-zA-Z][a-zA-Z0-9]*):\s?(.*)$/;
const SEPARATOR = /^---\s*$/;

function parseBlocks(raw: string): Block[] {
  const lines = raw.split(/\r?\n/);
  const blocks: Block[] = [];
  let current: Block = {};
  let lastKey: string | null = null;
  let inBody = false;
  let bodyLines: string[] = [];

  const flush = () => {
    if (inBody) {
      const joined = bodyLines.join("\n").replace(/^\n+|\n+$/g, "");
      if (joined.length > 0) current.body = joined;
      inBody = false;
      bodyLines = [];
    }
    if (Object.keys(current).length > 0) blocks.push(current);
    current = {};
    lastKey = null;
  };

  for (const line of lines) {
    if (SEPARATOR.test(line)) {
      flush();
      continue;
    }
    if (inBody) {
      bodyLines.push(line);
      continue;
    }
    if (line.trim() === "") {
      lastKey = null;
      continue;
    }
    const m = line.match(KEY_LINE);
    if (m && m[1] && m[2] !== undefined) {
      const [, key, value] = m;
      if (key === "body") {
        inBody = true;
        if (value.length > 0) bodyLines.push(value);
        continue;
      }
      current[key] = value.trim();
      lastKey = key;
    } else if (lastKey !== null) {
      current[lastKey] = (current[lastKey] ?? "") + " " + line.trim();
    }
  }
  flush();
  return blocks;
}

const KEY_ORDER = [
  "title",
  "subTitle",
  "group",
  "callout1",
  "callout2",
  "pullQuote1Top",
  "pullQuote1Bottom",
  "historyInfo1",
  "historyInfo2",
  "constructionInfo1",
  "constructionInfo2",
  "locationInfo1",
  "locationInfo2",
];

function serializeBlock(block: Block): string {
  const out: string[] = [];
  for (const key of KEY_ORDER) {
    const v = block[key];
    if (v !== undefined && v.length > 0) out.push(`${key}: ${v}`);
  }
  // Any other keys (defensive — preserve unknown fields)
  for (const key of Object.keys(block)) {
    if (KEY_ORDER.includes(key) || key === "body") continue;
    const v = block[key];
    if (v !== undefined && v.length > 0) out.push(`${key}: ${v}`);
  }
  if (block.body && block.body.length > 0) {
    out.push("body:");
    out.push(block.body);
  }
  return out.join("\n");
}

function serializeBlocks(blocks: Block[]): string {
  return blocks.map(serializeBlock).join("\n\n---\n\n") + "\n";
}

// ---------- per-file migration ----------

type Stats = {
  category: Category;
  updated: number;
  appended: number;
  heroes: number;
  skipped: number;
};

function migrateSubEntries(
  category: Exclude<Category, "regions">,
  codexRoot: string,
  dryRun: boolean,
): Stats {
  const cfg = CATEGORY_TO_CHAPTER[category];
  const chapterPath = join(APP_ROOT, cfg.file);
  const stats: Stats = { category, updated: 0, appended: 0, heroes: 0, skipped: 0 };

  const raw = readFileSync(chapterPath, "utf8");
  const blocks = parseBlocks(raw);
  if (blocks.length === 0) throw new Error(`no blocks in ${cfg.file}`);

  // index existing sub-entries (skip block 0 = chapter overview)
  const subIndex = new Map<string, number>();
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block) continue;
    const title = block.title;
    if (title) subIndex.set(slug(title), i);
  }

  const codexFiles = readdirSync(join(codexRoot, "public", "codex"))
    .filter((n) => n.endsWith(".md"))
    .sort();

  for (const fname of codexFiles) {
    const codexAbs = join(codexRoot, "public", "codex", fname);
    const parsed = matter(readFileSync(codexAbs, "utf8"));
    const data = parsed.data as Record<string, unknown>;
    if (data.category !== category) continue;

    const codexSlug = String(data.slug ?? basename(fname, ".md"));
    const title = String(data.title ?? "");
    if (!title) {
      stats.skipped++;
      continue;
    }
    // Skip codex hub entries (history-of-amra, magic-in-amra, cosmology-of-amra)
    // whose content overlaps the chapter overview block already in the app.
    if (codexSlug === cfg.chapterId || codexSlug === cfg.hubSlug) {
      stats.skipped++;
      continue;
    }
    const summary = data.summary ? String(data.summary) : undefined;
    const body = parsed.content.trim();
    if (!body) {
      stats.skipped++;
      continue;
    }

    const existingIdx = matchExisting(codexSlug, subIndex);
    if (existingIdx !== undefined) {
      const block = blocks[existingIdx];
      if (!block) continue;
      // Replace historyInfo* with codex body. Preserve title/subTitle/group/etc.
      delete block.historyInfo1;
      delete block.historyInfo2;
      block.body = body;
      if (!block.subTitle && summary) block.subTitle = summary;
      stats.updated++;
    } else {
      const newBlock: Block = { title };
      if (summary) newBlock.subTitle = summary;
      newBlock.body = body;
      blocks.push(newBlock);
      stats.appended++;
    }

    // Copy hero image
    const heroSrc = join(codexRoot, "public", "art", "codex", `${codexSlug}.webp`);
    if (existsSync(heroSrc)) {
      const heroDst = join(APP_ROOT, "assets", "heroes", "sub", cfg.chapterId, `${codexSlug}.webp`);
      if (!dryRun) {
        mkdirSync(dirname(heroDst), { recursive: true });
        copyFileSync(heroSrc, heroDst);
      }
      stats.heroes++;
    }
  }

  if (!dryRun) {
    writeFileSync(chapterPath, serializeBlocks(blocks), "utf8");
  }
  return stats;
}

// ---------- region migration ----------

function extractH2Body(body: string, name: string): string {
  const lines = body.split("\n");
  const captured: string[] = [];
  let capturing = false;
  for (const line of lines) {
    const h2m = line.match(/^##(?!#)\s+(.+?)\s*$/);
    if (h2m && h2m[1] !== undefined) {
      if (capturing) break;
      if (h2m[1].trim().toLowerCase() === name.toLowerCase()) {
        capturing = true;
        continue;
      }
    }
    if (capturing) captured.push(line);
  }
  return captured.join("\n").trim();
}

type RegionSection = { h2: string; title: string; level: 3 | 4; content: string };

// Extract sub-entry candidates from a region body:
//   - Every H3 (under any H2) becomes a sub-entry, taking everything beneath
//     it (including inline H4 "Figures of Interest" NPC blocks) as content.
//   - Every H4 directly under an H2 (no H3 in between) becomes a sub-entry —
//     this captures the codex's "## Sites" section, which lists individual
//     landmarks as H4 children of H2 rather than H3.
//   - Sections under an H2 named "Figures" are skipped: those are duplicate
//     summaries of houses already captured under "## Politics".
function extractRegionSections(body: string): RegionSection[] {
  const out: RegionSection[] = [];
  let h2 = "";
  let h2HasH3 = false;
  let currentTitle: string | null = null;
  let currentLevel: 3 | 4 = 3;
  let currentContent: string[] = [];

  const flush = () => {
    if (currentTitle !== null && h2.toLowerCase() !== "figures") {
      out.push({ h2, title: currentTitle, level: currentLevel, content: currentContent.join("\n").trim() });
    }
    currentTitle = null;
    currentContent = [];
  };

  for (const line of body.split("\n")) {
    const h2m = line.match(/^##(?!#)\s+(.+?)\s*$/);
    const h3m = line.match(/^###(?!#)\s+(.+?)\s*$/);
    const h4m = line.match(/^####(?!#)\s+(.+?)\s*$/);
    if (h2m && h2m[1] !== undefined) {
      flush();
      h2 = h2m[1].trim();
      h2HasH3 = false;
      continue;
    }
    if (h3m && h3m[1] !== undefined) {
      flush();
      currentTitle = h3m[1].trim();
      currentLevel = 3;
      h2HasH3 = true;
      continue;
    }
    if (h4m && h4m[1] !== undefined && !h2HasH3) {
      // H4 directly under an H2 (codex "Sites" pattern) → its own sub-entry
      flush();
      currentTitle = h4m[1].trim();
      currentLevel = 4;
      continue;
    }
    if (currentTitle !== null) currentContent.push(line);
  }
  flush();
  return out;
}

function h2ToGroup(h2: string): string {
  const norm = h2.toLowerCase();
  if (norm === "politics") return "Noble Houses";
  if (norm === "settlements") return "Settlements";
  if (norm === "sites") return "Places & Landmarks";
  if (norm === "" || norm === "overview") return "";
  return h2;
}

function codexSlugToAppFile(codexSlug: string): string {
  // codex uses hyphens, existing gazetteer files use underscores
  return codexSlug.replace(/-/g, "_") + ".md";
}

function migrateRegions(codexRoot: string, dryRun: boolean, forceRegionHeroes: boolean): Stats {
  const stats: Stats = { category: "regions", updated: 0, appended: 0, heroes: 0, skipped: 0 };
  const codexDir = join(codexRoot, "public", "codex");
  const codexFiles = readdirSync(codexDir).filter((n) => n.endsWith(".md")).sort();

  for (const fname of codexFiles) {
    const parsed = matter(readFileSync(join(codexDir, fname), "utf8"));
    if (parsed.data.category !== "regions") continue;

    const codexSlug = String(parsed.data.slug ?? basename(fname, ".md"));
    const regionPath = join(APP_ROOT, "lore", "8_gazetteer", codexSlugToAppFile(codexSlug));
    if (!existsSync(regionPath)) {
      console.log(`  [regions] no existing file for ${codexSlug} (expected ${regionPath}) — skipping`);
      stats.skipped++;
      continue;
    }

    // Optional: overwrite the curated tome hero with the codex version.
    if (forceRegionHeroes) {
      const heroSrc = join(codexRoot, "public", "art", "codex", `${codexSlug}.webp`);
      const heroDst = join(APP_ROOT, "assets", "heroes", `${codexSlug}.webp`);
      if (existsSync(heroSrc)) {
        if (!dryRun) {
          mkdirSync(dirname(heroDst), { recursive: true });
          copyFileSync(heroSrc, heroDst);
        }
        stats.heroes++;
      }
    }

    const blocks = parseBlocks(readFileSync(regionPath, "utf8"));
    if (blocks.length === 0) continue;

    // Update region overview body with codex "## Overview" section
    const overviewBody = extractH2Body(parsed.content, "Overview");
    if (overviewBody && blocks[0]) {
      blocks[0].body = overviewBody;
      stats.updated++;
    }

    // Index existing sub-entries by slug (skip block 0)
    const subIndex = new Map<string, number>();
    for (let i = 1; i < blocks.length; i++) {
      const t = blocks[i]?.title;
      if (t) subIndex.set(slug(t), i);
    }

    for (const section of extractRegionSections(parsed.content)) {
      if (!section.content) continue;
      const sectionSlug = slug(section.title);
      const existingIdx = matchExisting(sectionSlug, subIndex);
      if (existingIdx !== undefined) {
        const block = blocks[existingIdx];
        if (!block) continue;
        delete block.historyInfo1;
        delete block.historyInfo2;
        block.body = section.content;
        stats.updated++;
      } else {
        const newBlock: Block = { title: section.title, body: section.content };
        const g = h2ToGroup(section.h2);
        if (g) newBlock.group = g;
        blocks.push(newBlock);
        stats.appended++;
      }
    }

    if (!dryRun) writeFileSync(regionPath, serializeBlocks(blocks), "utf8");
  }

  return stats;
}

// ---------- align (codex parity) ----------

// Web's per-category sort pins, mirrors /Users/eridia/Projects/amra-world/lib/codexFilters.js
const CATEGORY_PRIORITY: Record<string, Record<string, number>> = {
  gods: { "beral-the-creator": -1 },
  history: { "present-age-of-amra": 1 },
};

// Pass A: rebuild a chapter's sub-entries from the codex source.
// Keeps block 0 (curated overview) verbatim; replaces all sub-entry blocks with
// fresh ones whose title/subTitle/body come directly from the codex frontmatter
// + markdown body. Entries are sorted to match the web codex view: alphabetical
// by codex slug with explicit priority overrides.
function rebuildChapter(
  category: Exclude<Category, "regions">,
  codexRoot: string,
  dryRun: boolean,
): { kept: number; newTitles: string[] } {
  const cfg = CATEGORY_TO_CHAPTER[category];
  const chapterPath = join(APP_ROOT, cfg.file);
  const codexDir = join(codexRoot, "public", "codex");

  const blocks = parseBlocks(readFileSync(chapterPath, "utf8"));
  const overview = blocks[0];
  if (!overview) throw new Error(`no overview block in ${cfg.file}`);

  type CodexEntry = { slug: string; title: string; summary?: string; body: string };
  const entries: CodexEntry[] = [];
  for (const fname of readdirSync(codexDir)) {
    if (!fname.endsWith(".md")) continue;
    const parsed = matter(readFileSync(join(codexDir, fname), "utf8"));
    const data = parsed.data as Record<string, unknown>;
    if (data.category !== category) continue;
    const codexSlug = String(data.slug ?? basename(fname, ".md"));
    if (codexSlug === cfg.chapterId || codexSlug === cfg.hubSlug) continue;
    const entry: CodexEntry = {
      slug: codexSlug,
      title: String(data.title ?? codexSlug),
      body: parsed.content.trim(),
    };
    if (data.summary) entry.summary = String(data.summary).trim();
    entries.push(entry);
  }

  const priority = CATEGORY_PRIORITY[category] ?? {};
  entries.sort((a, b) => {
    const pa = priority[a.slug] ?? 0;
    const pb = priority[b.slug] ?? 0;
    if (pa !== pb) return pa - pb;
    return a.slug.localeCompare(b.slug);
  });

  const newBlocks: Block[] = entries.map((e) => {
    const block: Block = { title: e.title, body: e.body };
    if (e.summary) block.subTitle = e.summary;
    return block;
  });

  const out = [overview, ...newBlocks];
  if (!dryRun) writeFileSync(chapterPath, serializeBlocks(out), "utf8");
  return {
    kept: newBlocks.length,
    newTitles: newBlocks.map((b) => b.title ?? ""),
  };
}

// Pass B: rewrite each region as a single block whose body holds the full
// codex markdown (Overview + Politics + Settlements + Sites + Figures).
function flattenRegion(
  codexRoot: string,
  dryRun: boolean,
): { regions: number; subEntriesDropped: number } {
  let regions = 0;
  let subEntriesDropped = 0;
  const codexDir = join(codexRoot, "public", "codex");

  for (const fname of readdirSync(codexDir).sort()) {
    if (!fname.endsWith(".md")) continue;
    const parsed = matter(readFileSync(join(codexDir, fname), "utf8"));
    if (parsed.data.category !== "regions") continue;

    const codexSlug = String(parsed.data.slug ?? basename(fname, ".md"));
    const regionPath = join(APP_ROOT, "lore", "8_gazetteer", codexSlugToAppFile(codexSlug));
    if (!existsSync(regionPath)) continue;

    const blocks = parseBlocks(readFileSync(regionPath, "utf8"));
    if (blocks.length === 0) continue;
    const overview = blocks[0]!;

    overview.body = parsed.content.trim();
    if ((!overview.subTitle || overview.subTitle.trim().length === 0) && parsed.data.summary) {
      overview.subTitle = String(parsed.data.summary).trim();
    }

    subEntriesDropped += blocks.length - 1;
    regions++;
    if (!dryRun) writeFileSync(regionPath, serializeBlocks([overview]), "utf8");
  }
  return { regions, subEntriesDropped };
}

// Pass C: remove the Introduction chapter entirely.
function removeIntroduction(dryRun: boolean): { removed: string[] } {
  const removed: string[] = [];
  const targets = [
    join(APP_ROOT, "lore", "1_introduction.md"),
    join(APP_ROOT, "assets", "heroes", "introduction.webp"),
  ];
  for (const p of targets) {
    if (existsSync(p)) {
      if (!dryRun) unlinkSync(p);
      removed.push(p);
    }
  }
  return { removed };
}

function align(args: Args) {
  console.log(`codex-migrate --align${args.dryRun ? " (dry-run)" : ""}`);

  console.log("");
  console.log("[pass A] rebuild chapters from codex source (web parity)");
  for (const cat of Object.keys(CATEGORY_TO_CHAPTER) as Array<Exclude<Category, "regions">>) {
    const r = rebuildChapter(cat, args.source, args.dryRun);
    const preview = r.newTitles.slice(0, 4).join(", ");
    const more = r.newTitles.length > 4 ? `, +${r.newTitles.length - 4} more` : "";
    console.log(`  ${cat.padEnd(10)} entries=${r.kept}`);
    console.log(`    ↳ ${preview}${more}`);
  }

  console.log("");
  console.log("[pass B] flatten regions into single-body articles");
  const flat = flattenRegion(args.source, args.dryRun);
  console.log(`  regions=${flat.regions} sub-entries-dropped=${flat.subEntriesDropped}`);

  console.log("");
  console.log("[pass C] remove Introduction chapter");
  const intro = removeIntroduction(args.dryRun);
  for (const p of intro.removed) console.log(`  ${args.dryRun ? "would remove" : "removed"} ${p}`);
  if (intro.removed.length === 0) console.log("  (already removed)");
}

// ---------- main ----------

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.align) {
    align(args);
    return;
  }

  console.log(
    `codex-migrate → source=${args.source}${args.dryRun ? " (dry-run)" : ""} categories=${args.categories.join(",")}`,
  );

  for (const cat of args.categories) {
    if (cat === "regions") {
      const stats = migrateRegions(args.source, args.dryRun, args.forceRegionHeroes);
      console.log(
        `[${cat}] updated=${stats.updated} appended=${stats.appended} heroes-copied=${stats.heroes} skipped=${stats.skipped}`,
      );
      continue;
    }
    const stats = migrateSubEntries(cat, args.source, args.dryRun);
    console.log(
      `[${cat}] updated=${stats.updated} appended=${stats.appended} heroes-copied=${stats.heroes} skipped=${stats.skipped}`,
    );
  }
}

main();
