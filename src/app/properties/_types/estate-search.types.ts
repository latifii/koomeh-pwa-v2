export type EstateSearchParams = {
  type?: 1 | 2;
  id?: number;
  estateTypes?: string | readonly (string | number)[];
  city_id?: number;
  districts?: string | readonly (string | number)[];
  areas?: string | readonly (string | number)[];
  q?: string;
  title?: string;
  room_count?: number;
  minArea?: number;
  maxArea?: number;
  price?: string;
  mortgage?: string;
  /** Alias accepted by the API for `mortgage`. */
  rahn?: string;
  rent?: string;
  built_year?: number;
  conditions?: string | readonly (string | number)[];
  facilities?: string | readonly (string | number)[];
  has_photo?: boolean;
  has_video?: boolean;
  vr?: boolean;
  has_agent?: boolean;
  sortBy?: 1 | 2 | 3 | 4;
  sortType?: 1 | 2;
  page?: number;
  per_page?: number;
};

export type EstateSearchRequestOptions = {
  signal?: AbortSignal;
};

export type EstateMapParams = Omit<
  EstateSearchParams,
  "page" | "per_page"
> & {
  limit?: number;
};
