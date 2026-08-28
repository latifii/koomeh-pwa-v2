import type { Estate, PropertyType } from "@/data/home";

export type EstateDetailRequestOptions = {
  signal?: AbortSignal;
};

export type EstateSimilarParams = {
  page?: number;
  per_page?: number;
};

/** A labelled fact from the API's `details` array. */
export type EstateFactRow = {
  key: string;
  label: string;
  value: string;
};

export type EstateFeature = {
  id: number;
  label: string;
  icon?: string;
};

/** `features` grouped the way the API groups it, e.g. "امکانات" / "آشپزخانه". */
export type EstateFeatureGroup = {
  key: string;
  label: string;
  items: EstateFeature[];
};

export type EstatePhoto = {
  id: number;
  url: string;
  thumbnail?: string;
  large?: string;
  isCover: boolean;
};

export type EstateGalleryView = {
  coverImage?: string;
  photos: EstatePhoto[];
  plans: EstatePhoto[];
  tour: EstatePhoto[];
};

export type EstateLocationView = {
  cityName?: string;
  districtName?: string;
  districtId?: number;
  street?: string;
  addressLabel?: string;
  isFullAddress: boolean;
  hasMap: boolean;
  lat?: number;
  lng?: number;
};

export type EstateAgentView = {
  id: number;
  name: string;
  code?: string;
  title?: string;
  bio?: string;
  photo?: string;
  activityLabel?: string;
  roles: string[];
  canChat: boolean;
  href?: string;
};

/** One revealed phone number, as returned by `/contact`. */
export type EstateContactEntry = {
  role: string;
  roleLabel: string;
  name?: string;
  phone: string;
  telUrl: string;
};

export type EstateContactSummary = {
  /** "expert" when a branch agent handles the file, "user" for owner files. */
  type: string;
  name?: string;
  hasPhone: boolean;
};

export type EstateVideo = {
  provider?: string;
  embedUrl: string;
};

export type EstateMediaView = {
  coverImage?: string;
  photoCount: number;
  planCount: number;
  tourImageCount: number;
  hasVirtualTour: boolean;
  hasVideo: boolean;
  video?: EstateVideo;
};

export type EstateStatusView = {
  confirmation: string;
  confirmationLabel: string;
  isVerified: boolean;
  isExpired: boolean;
  stamp?: string;
};

export type EstatePriceView = {
  /** Toman, unformatted. For structured data — render `label` instead. */
  amount?: number;
  label: string;
  perMeterLabel?: string;
  isNegotiable: boolean;
};

export type EstateRentView = {
  /** Toman, unformatted. For structured data — render the labels instead. */
  mortgage?: number;
  mortgageLabel: string;
  amount?: number;
  rentLabel: string;
};

export type EstateExchangeView = {
  available: boolean;
  description?: string;
};

export type EstateTourImage = {
  id: number;
  url: string;
};

export type EstateTourView = {
  estateId: string;
  title: string;
  externalTourUrl?: string;
  imageCount: number;
  images: EstateTourImage[];
};

/** Everything the detail page renders, already formatted for display. */
export type EstateDetailView = {
  id: string;
  numericId: number;
  title: string;
  dealType: "sale" | "rent";
  dealTypeLabel: string;
  propertyType: PropertyType;
  estateTypeLabel: string;
  area?: number;
  roomLabel?: string;
  status: EstateStatusView;
  price?: EstatePriceView;
  rent?: EstateRentView;
  location: EstateLocationView;
  facts: EstateFactRow[];
  featureGroups: EstateFeatureGroup[];
  conditions: EstateFeature[];
  description?: string;
  exchange?: EstateExchangeView;
  media: EstateMediaView;
  agent?: EstateAgentView;
  contact?: EstateContactSummary;
  visitCount?: number;
  publishedLabel?: string;
  updatedDaysAgo?: number;
  isSpecial: boolean;
  /** Related-service URLs the API hands out, e.g. `request_visit`. */
  links: Record<string, string>;
};

export type EstateSimilarView = {
  title: string;
  total: number;
  items: Estate[];
};
