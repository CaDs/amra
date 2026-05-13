import type { ImageSourcePropType } from "react-native";
import type { Focal } from "../components/primitives/FocalImage";
import { tomeHeroes, subEntryHeroes } from "./heroRegistry.generated";

export type HeroImage = {
  source: ImageSourcePropType;
  focal?: Focal;
};

// Focal-point overrides for heroes whose subject is off-center. The image
// source itself is resolved from the generated registry, which scans
// assets/heroes/ at build time.
const tomeFocals: Record<string, Focal> = {
  banlaya: { x: 0.6, y: 0.5 },
  manajur: { x: 0.7, y: 0.55 },
};

const subEntryFocals: Record<string, Focal> = {};

export function getHeroImage(tomeId: string | undefined): HeroImage | undefined {
  if (!tomeId) return undefined;
  const source = tomeHeroes[tomeId];
  if (!source) return undefined;
  const focal = tomeFocals[tomeId];
  return focal ? { source, focal } : { source };
}

export function getSubEntryHero(
  tomeId: string | undefined,
  entryId: string | undefined,
): HeroImage | undefined {
  if (!tomeId || !entryId) return undefined;
  const key = `${tomeId}/${entryId}`;
  const source = subEntryHeroes[key];
  if (!source) return undefined;
  const focal = subEntryFocals[key];
  return focal ? { source, focal } : { source };
}
