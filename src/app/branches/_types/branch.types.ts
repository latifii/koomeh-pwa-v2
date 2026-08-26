import type { AgentDto } from "@/app/agents/_schemas/agents.schema";
import type { Estate } from "@/data/home";

export type BranchType = 1 | 2;

export type BranchSearchParams = {
  name?: string;
  city_id?: number;
  all?: boolean;
  districts?: string | readonly (string | number)[];
  type?: BranchType;
  has_map?: boolean;
  page?: number;
  per_page?: number;
};

export type BranchRequestOptions = {
  signal?: AbortSignal;
};

export type BranchEstateParams = {
  type?: BranchType;
  page?: number;
  per_page?: number;
};

export type BranchAgentsParams = {
  has_photo?: boolean;
  page?: number;
  per_page?: number;
};

export type BranchLocation = {
  id: number;
  name: string;
};

export type BranchCard = {
  id: string;
  numericId: number;
  name: string;
  type?: BranchType;
  typeLabel?: string;
  phone?: string;
  address?: string;
  city?: BranchLocation;
  district?: BranchLocation;
  lat?: number;
  lng?: number;
  hasMap: boolean;
  coverImage?: string;
  agentCount?: number;
  experience?: string;
  href: string;
};

export type BranchWorkingHour = {
  days: string;
  hours: string;
  closed?: boolean;
};

export type BranchGalleryImage = {
  id: number;
  url: string;
  isCover: boolean;
};

export type BranchProfile = BranchCard & {
  description: string;
  descriptionParagraphs: string[];
  workingHours: BranchWorkingHour[];
  coveredDistricts: BranchLocation[];
  images: BranchGalleryImage[];
  telUrl?: string;
  agents: AgentDto[];
  estates: Estate[];
  estateTotal?: number;
};
