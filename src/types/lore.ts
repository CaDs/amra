export type PullQuote = { top: string; bottom: string };

export type Entry = {
  id: string;
  title: string;
  subTitle?: string;
  group?: string;
  pullQuote?: PullQuote;
  callouts?: string[];
  history?: [string] | [string, string];
  construction?: [string] | [string, string];
  location?: [string] | [string, string];
  heroImage?: string;
};

export type TomeKind = "chapter" | "region";

export type Tome = {
  id: string;
  kind: TomeKind;
  order: number;
  overview: Entry;
  subEntries: Entry[];
  wordCount: number;
};

export type HomeSpread = {
  id: string;
  title: string;
  subTitle?: string;
  callouts?: string[];
  pullQuote?: PullQuote;
  routeTomeId?: string;
  routeGazetteer?: boolean;
};

export type Lore = {
  homeSpreads: HomeSpread[];
  tomes: Tome[];
  generatedAt: string;
};
