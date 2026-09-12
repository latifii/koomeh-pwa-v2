/**
 * Everything `GET /api/site3/customers` reads, in the API's own names. The
 * page's filter state (`CustomerFilters`, below) is mapped onto this in
 * `_lib/customer-filter-params.ts`; the service only normalises values.
 */
export type CustomerListParams = {
  id?: number;
  /** 1 = buy (the API's default), 2 = rent. */
  request_type?: 1 | 2;
  estate_type?: string | readonly (string | number)[];
  name?: string;
  mobile?: string;
  /** -1 means "no agent assigned". */
  user_id?: number;
  status?: number;
  label?: number;
  district_id?: string | readonly (string | number)[];
  area_min?: number;
  area_max?: number;
  price_min?: number;
  price_max?: number;
  mortgage_min?: number;
  mortgage_max?: number;
  rent_min?: number;
  rent_max?: number;
  financial_liquidity_type?: number;
  purchase_reason?: number;
  purchase_priority?: number;
  acquaintance_type?: number;
  residence_type?: number;
  usage_type?: number;
  geography?: number;
  build_license?: number;
  floor_count?: number;
  floor_start?: number;
  max_room_count?: number;
  max_unit_in_floor?: number;
  max_building_age?: number;
  min_floor_count?: number;
  min_floor_area?: number;
  min_front_area?: number;
  min_density?: number;
  min_street_width?: number;
  conditions?: string | readonly (string | number)[];
  facilities?: string | readonly (string | number)[];
  create_date_of?: string;
  create_date_to?: string;
  today?: boolean;
  favorite?: boolean;
  order?: string;
  orderby?: "asc" | "desc";
  page?: number;
  per_page?: number;
};

/**
 * The page's filter state — the old «لیست مشتریان» form, control for control.
 * All strings, so one object feeds the form, the chips and the URL; a tick is
 * `"1"` or `""`, a multi-select is comma-separated ids.
 *
 * `agent` has one extra value: `AGENT_DEFAULT`, meaning «whatever this role
 * saw on the old page» — an agent's own customers, everyone's for an
 * administrator. It is resolved against the session when the request is
 * built, never stored as an id, so a page opened before the session has
 * loaded still lands on the right default.
 */
export const AGENT_DEFAULT = "auto";
/** Everyone — the old dropdown's «همه مشتری‌ها». */
export const AGENT_ALL = "all";
/** The API's «بدون مشاور». */
export const AGENT_NONE = "-1";

export type CustomerFilters = {
  /* the quick bar */
  query: string;
  requestType: string;
  status: string;
  estateType: string;
  agent: string;
  /* identity */
  code: string;
  name: string;
  mobile: string;
  /* place */
  districtIds: string;
  /* size and budget */
  areaMin: string;
  areaMax: string;
  priceMin: string;
  priceMax: string;
  mortgageMin: string;
  mortgageMax: string;
  rentMin: string;
  rentMax: string;
  /* the customer */
  label: string;
  financialLiquidity: string;
  purchaseReason: string;
  purchasePriority: string;
  acquaintance: string;
  /* the wanted property */
  residenceType: string;
  usageType: string;
  geography: string;
  buildLicense: string;
  floorCount: string;
  floorStart: string;
  maxRoomCount: string;
  maxUnitInFloor: string;
  maxBuildingAge: string;
  minFloorCount: string;
  minFloorArea: string;
  minFrontArea: string;
  minDensity: string;
  minStreetWidth: string;
  conditions: string;
  facilities: string;
  /* dates and ticks */
  createFrom: string;
  createTo: string;
  today: string;
  favorite: string;
  /* order and page size */
  order: string;
  orderBy: string;
  perPage: string;
};

export const defaultCustomerFilters: CustomerFilters = {
  query: "",
  requestType: "1",
  status: "",
  estateType: "",
  agent: AGENT_DEFAULT,
  code: "",
  name: "",
  mobile: "",
  districtIds: "",
  areaMin: "",
  areaMax: "",
  priceMin: "",
  priceMax: "",
  mortgageMin: "",
  mortgageMax: "",
  rentMin: "",
  rentMax: "",
  label: "",
  financialLiquidity: "",
  purchaseReason: "",
  purchasePriority: "",
  acquaintance: "",
  residenceType: "",
  usageType: "",
  geography: "",
  buildLicense: "",
  floorCount: "",
  floorStart: "",
  maxRoomCount: "",
  maxUnitInFloor: "",
  maxBuildingAge: "",
  minFloorCount: "",
  minFloorArea: "",
  minFrontArea: "",
  minDensity: "",
  minStreetWidth: "",
  conditions: "",
  facilities: "",
  createFrom: "",
  createTo: "",
  today: "",
  favorite: "",
  order: "",
  orderBy: "",
  perPage: "",
};
