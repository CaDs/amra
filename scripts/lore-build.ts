import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import type { Entry, HomeSpread, Lore, Tome } from "../src/types/lore.js";

const ROOT = join(__dirname, "..");
const LORE_DIR = join(ROOT, "lore");
const GAZETTEER_DIR = join(LORE_DIR, "8_gazetteer");
const OUT_DIR = join(ROOT, "assets");
const OUT_FILE = join(OUT_DIR, "lore.json");
const HEROES_DIR = join(OUT_DIR, "heroes");
const SUB_HEROES_DIR = join(HEROES_DIR, "sub");
const HERO_REGISTRY_FILE = join(ROOT, "src", "data", "heroRegistry.generated.ts");

const KEY_LINE = /^([a-zA-Z][a-zA-Z0-9]*):\s?(.*)$/;
const SEPARATOR = /^---\s*$/;

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

function parseBlocks(raw: string): Record<string, string>[] {
  const lines = raw.split(/\r?\n/);
  const blocks: Record<string, string>[] = [];
  let current: Record<string, string> = {};
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

function blockToEntry(block: Record<string, string>, fallbackId?: string): Entry | null {
  const title = block.title?.trim();
  if (!title) return null;
  const id = fallbackId ?? slug(title);

  const entry: Entry = { id, title };
  if (block.subTitle) entry.subTitle = block.subTitle.trim();
  if (block.group) entry.group = block.group.trim();
  if (block.pullQuote1Top || block.pullQuote1Bottom) {
    entry.pullQuote = {
      top: (block.pullQuote1Top ?? "").trim(),
      bottom: (block.pullQuote1Bottom ?? "").trim(),
    };
  }
  const callouts: string[] = [];
  if (block.callout1) callouts.push(block.callout1.trim());
  if (block.callout2) callouts.push(block.callout2.trim());
  if (callouts.length > 0) entry.callouts = callouts;

  const pair = (a?: string, b?: string): [string] | [string, string] | undefined => {
    if (a && b) return [a.trim(), b.trim()];
    if (a) return [a.trim()];
    if (b) return [b.trim()];
    return undefined;
  };
  const history = pair(block.historyInfo1, block.historyInfo2);
  if (history) entry.history = history;
  const construction = pair(block.constructionInfo1, block.constructionInfo2);
  if (construction) entry.construction = construction;
  const location = pair(block.locationInfo1, block.locationInfo2);
  if (location) entry.location = location;
  if (block.body && block.body.trim().length > 0) entry.body = block.body;
  return entry;
}

function entryWordCount(e: Entry): number {
  const parts: string[] = [];
  if (e.history) parts.push(...e.history);
  if (e.construction) parts.push(...e.construction);
  if (e.location) parts.push(...e.location);
  if (e.callouts) parts.push(...e.callouts);
  if (e.body) parts.push(e.body);
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

function tomeWordCount(t: Tome): number {
  return entryWordCount(t.overview) + t.subEntries.reduce((n, e) => n + entryWordCount(e), 0);
}

function buildTomeFromFile(
  filePath: string,
  kind: "chapter" | "region",
  order: number,
  tomeId?: string,
): Tome | null {
  const raw = readFileSync(filePath, "utf8");
  const blocks = parseBlocks(raw);
  if (blocks.length === 0) return null;

  const overviewBlock = blocks[0];
  if (!overviewBlock) return null;
  const overviewEntry = blockToEntry(overviewBlock, slug(overviewBlock.title ?? ""));
  if (!overviewEntry) return null;

  const id = tomeId ?? overviewEntry.id;
  const subEntries: Entry[] = [];
  const seenIds = new Set<string>([overviewEntry.id]);
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block) continue;
    const entry = blockToEntry(block);
    if (!entry) continue;
    let candidateId = entry.id;
    let suffix = 2;
    while (seenIds.has(candidateId)) {
      candidateId = `${entry.id}-${suffix++}`;
    }
    seenIds.add(candidateId);
    entry.id = candidateId;
    subEntries.push(entry);
  }

  const titles = new Set(subEntries.map((e) => e.title));
  const finalSubEntries: Entry[] = [];
  const injectedGroups = new Set<string>();
  for (const entry of subEntries) {
    if (entry.group && !titles.has(entry.group) && !injectedGroups.has(entry.group)) {
      let parentId = slug(entry.group);
      let suffix = 2;
      while (seenIds.has(parentId)) {
        parentId = `${slug(entry.group)}-${suffix++}`;
      }
      seenIds.add(parentId);
      finalSubEntries.push({ id: parentId, title: entry.group });
      injectedGroups.add(entry.group);
    }
    finalSubEntries.push(entry);
  }

  const tome: Tome = { id, kind, order, overview: overviewEntry, subEntries: finalSubEntries, wordCount: 0 };
  tome.wordCount = tomeWordCount(tome);
  return tome;
}

const CHAPTER_IDS: Record<string, string> = {
  "2_history_of_amra.md": "history-of-amra",
  "3_races.md": "races",
  "4_magic.md": "magic",
  "5_religions.md": "religions",
  "6_cosmology.md": "cosmology",
  "7_factions.md": "factions",
};

function build(): Lore {
  const tomes: Tome[] = [];

  const chapterFiles = readdirSync(LORE_DIR)
    .filter((n) => /^[1-7]_.+\.md$/.test(n))
    .sort();

  for (const file of chapterFiles) {
    const order = Number(file.charAt(0));
    const id = CHAPTER_IDS[file] ?? slug(basename(file, ".md").replace(/^\d+_/, ""));
    const tome = buildTomeFromFile(join(LORE_DIR, file), "chapter", order, id);
    if (tome) tomes.push(tome);
  }

  const regionFiles = readdirSync(GAZETTEER_DIR)
    .filter((n) => n.endsWith(".md"))
    .sort();

  for (const file of regionFiles) {
    const id = slug(basename(file, ".md").replace(/_/g, "-"));
    const tome = buildTomeFromFile(join(GAZETTEER_DIR, file), "region", 8, id);
    if (tome) tomes.push(tome);
  }

  const homeSpreads: HomeSpread[] = [];
  for (const tome of tomes.filter((t) => t.kind === "chapter")) {
    const spread: HomeSpread = {
      id: tome.id,
      title: tome.overview.title,
      routeTomeId: tome.id,
    };
    if (tome.overview.subTitle) spread.subTitle = tome.overview.subTitle;
    if (tome.overview.pullQuote) spread.pullQuote = tome.overview.pullQuote;
    if (tome.overview.callouts) spread.callouts = tome.overview.callouts;
    homeSpreads.push(spread);
  }
  homeSpreads.push({
    id: "gazetteer",
    title: "The Gazetteer",
    subTitle: "Realms of the continent",
    pullQuote: { top: "Of cities", bottom: "and the wild between" },
    callouts: [
      `Fifteen regions, from the marble courts of Aregor to the highland clans of Skapta — every realm of Amra in one atlas.`,
      `Each region carries its own histories, factions, and forgotten places, mapped for the curious traveler.`,
    ],
    routeGazetteer: true,
  });

  const lore: Lore = {
    homeSpreads,
    tomes,
    generatedAt: new Date().toISOString(),
  };
  return lore;
}

function writeHeroRegistry(): { tomes: number; subs: number } {
  const tomeEntries: Array<{ id: string; rel: string }> = [];
  if (existsSync(HEROES_DIR)) {
    for (const name of readdirSync(HEROES_DIR).sort()) {
      const abs = join(HEROES_DIR, name);
      if (!statSync(abs).isFile()) continue;
      if (!/\.webp$/i.test(name)) continue;
      const id = basename(name, ".webp");
      tomeEntries.push({ id, rel: `../../assets/heroes/${name}` });
    }
  }

  const subEntries: Array<{ key: string; rel: string }> = [];
  if (existsSync(SUB_HEROES_DIR)) {
    for (const tomeId of readdirSync(SUB_HEROES_DIR).sort()) {
      const tomeDir = join(SUB_HEROES_DIR, tomeId);
      if (!statSync(tomeDir).isDirectory()) continue;
      for (const name of readdirSync(tomeDir).sort()) {
        const abs = join(tomeDir, name);
        if (!statSync(abs).isFile()) continue;
        if (!/\.webp$/i.test(name)) continue;
        const entryId = basename(name, ".webp");
        subEntries.push({
          key: `${tomeId}/${entryId}`,
          rel: `../../assets/heroes/sub/${tomeId}/${name}`,
        });
      }
    }
  }

  const lines: string[] = [];
  lines.push("// auto-generated by scripts/lore-build.ts — do not edit by hand");
  lines.push("import type { ImageSourcePropType } from \"react-native\";");
  lines.push("");
  lines.push("export const tomeHeroes: Record<string, ImageSourcePropType> = {");
  for (const { id, rel } of tomeEntries) {
    lines.push(`  ${JSON.stringify(id)}: require(${JSON.stringify(rel)}),`);
  }
  lines.push("};");
  lines.push("");
  lines.push("export const subEntryHeroes: Record<string, ImageSourcePropType> = {");
  for (const { key, rel } of subEntries) {
    lines.push(`  ${JSON.stringify(key)}: require(${JSON.stringify(rel)}),`);
  }
  lines.push("};");
  lines.push("");

  mkdirSync(join(ROOT, "src", "data"), { recursive: true });
  writeFileSync(HERO_REGISTRY_FILE, lines.join("\n"), "utf8");
  return { tomes: tomeEntries.length, subs: subEntries.length };
}

const lore = build();

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(lore, null, 2), "utf8");

const heroes = writeHeroRegistry();

const chapters = lore.tomes.filter((t) => t.kind === "chapter").length;
const regions = lore.tomes.filter((t) => t.kind === "region").length;
const subTotal = lore.tomes.reduce((n, t) => n + t.subEntries.length, 0);
console.log(
  `lore.json written → ${chapters} chapters, ${regions} regions, ${subTotal} sub-entries, ${lore.homeSpreads.length} home spreads`,
);
console.log(
  `heroRegistry.generated.ts written → ${heroes.tomes} tome heroes, ${heroes.subs} sub-entry heroes`,
);
