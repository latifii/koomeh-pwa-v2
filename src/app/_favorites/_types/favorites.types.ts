import type { AgentDto } from "@/app/agents/_schemas/agents.schema";
import type { Estate } from "@/data/home";

export type FavoriteEstate = Estate & {
  pinned: boolean;
  /** The API still lists an expired file, flagged, rather than hiding it. */
  isExpired: boolean;
};

export type FavoriteAgent = AgentDto & { pinned: boolean };

/** A `list` row arrives as an array; everything else is preformatted text. */
export type CompareValue = string | number | boolean | string[] | null;

export type CompareRow = {
  key: string;
  label: string;
  type: string;
};

export type CompareItem = {
  id: string;
  title: string;
  coverImage?: string;
  href: string;
  pinned: boolean;
  values: Record<string, CompareValue>;
  /** Row keys where this file holds the best value in its group. */
  best: string[];
};

export type CompareGroup = {
  dealType: number;
  dealTypeLabel: string;
  rows: CompareRow[];
  items: CompareItem[];
};

export type CompareView = {
  total: number;
  groups: CompareGroup[];
};
