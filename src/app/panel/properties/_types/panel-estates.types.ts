/**
 * Everything `GET /api/site3/properties` reads, in the API's own names. The
 * page's filter state (`PanelEstateFilters`, below) is mapped onto this in
 * `_lib/estate-filter-params.ts`; the service only normalises values.
 */
export type PanelEstateParams = {
  id?: number;
  type?: 1 | 2;
  estateTypes?: number;
  confirmation?: string;
  visibility?: 0 | 1;
  province_id?: number;
  city_id?: number;
  district_id?: string | readonly (string | number)[];
  area?: number;
  user_id?: number;
  expert_type?: number;
  title?: string;
  name?: string;
  username?: string;
  buildingname?: string;
  minArea?: number;
  maxArea?: number;
  built_area_min?: number;
  built_area_max?: number;
  room_count?: number;
  price?: string;
  price_per_meter?: string;
  mortgage?: string;
  rent?: string;
  usage_type?: number;
  document_type?: number;
  build_license?: number;
  position_type?: number;
  geography?: number;
  floor_start?: number;
  floor_min?: number;
  floor_max?: number;
  floor_count?: number;
  unit_in_floor?: number;
  unit_in_complex?: number;
  street_width?: number;
  build_density?: number;
  built_year_min?: number;
  built_year_max?: number;
  facilities?: string | readonly (string | number)[];
  conditions?: string | readonly (string | number)[];
  exchange?: 1;
  photo?: boolean;
  video?: boolean;
  vr?: boolean;
  urgent?: 1;
  keynot?: 1;
  onebuilding?: 1;
  SeparateVilla?: 1;
  existing_document?: 1;
  divar?: 1 | 2;
  favorite?: boolean;
  myexpert?: boolean;
  isexpire?: boolean;
  create_date_of?: string;
  create_date_to?: string;
  show_date_of?: string;
  show_date_to?: string;
  delivery_date_from?: string;
  delivery_date_to?: string;
  order?: string;
  orderby?: "asc" | "desc";
  page?: number;
  per_page?: number;
};

/**
 * The page's filter state — the old «لیست املاک» form, control for control.
 *
 * All strings so the same object feeds the form, the chips and the URL: a
 * tick box is `"1"` or `""`, a multi-select is comma-separated ids, a money
 * field is plain digits. Only what a user has set is ever sent; the mapping
 * to API parameters drops empty values.
 */
export type PanelEstateFilters = {
  /* the quick bar */
  query: string;
  confirmation: string;
  dealType: string;
  estateType: string;
  visibility: string;
  expert: string;
  /* identity */
  expertType: string;
  ownerName: string;
  ownerPhone: string;
  buildingName: string;
  /* place */
  cityId: string;
  areaId: string;
  districtIds: string;
  /* money */
  priceMin: string;
  priceMax: string;
  pricePerMeterMin: string;
  pricePerMeterMax: string;
  mortgageMin: string;
  mortgageMax: string;
  rentMin: string;
  rentMax: string;
  /* size and building */
  areaMin: string;
  areaMax: string;
  builtAreaMin: string;
  builtAreaMax: string;
  streetWidth: string;
  buildDensity: string;
  builtYearMin: string;
  builtYearMax: string;
  roomCount: string;
  /* floors */
  floorCount: string;
  floorMin: string;
  floorMax: string;
  unitInFloor: string;
  unitInComplex: string;
  floorStart: string;
  /* choices */
  usageType: string;
  documentType: string;
  buildLicense: string;
  positionType: string;
  geography: string;
  facilities: string;
  conditions: string;
  /* dates (Jalali Y/m/d) */
  createFrom: string;
  createTo: string;
  showFrom: string;
  showTo: string;
  deliveryFrom: string;
  deliveryTo: string;
  /* ticks */
  photo: string;
  video: string;
  vr: string;
  urgent: string;
  keynot: string;
  oneBuilding: string;
  separateVilla: string;
  exchange: string;
  existingDocument: string;
  divar: string;
  isExpire: string;
  favorite: string;
  myExpert: string;
  /* order and page size */
  order: string;
  orderBy: string;
  perPage: string;
};

export const defaultPanelEstateFilters: PanelEstateFilters = {
  query: "",
  confirmation: "",
  dealType: "",
  estateType: "",
  visibility: "",
  expert: "",
  expertType: "",
  ownerName: "",
  ownerPhone: "",
  buildingName: "",
  cityId: "",
  areaId: "",
  districtIds: "",
  priceMin: "",
  priceMax: "",
  pricePerMeterMin: "",
  pricePerMeterMax: "",
  mortgageMin: "",
  mortgageMax: "",
  rentMin: "",
  rentMax: "",
  areaMin: "",
  areaMax: "",
  builtAreaMin: "",
  builtAreaMax: "",
  streetWidth: "",
  buildDensity: "",
  builtYearMin: "",
  builtYearMax: "",
  roomCount: "",
  floorCount: "",
  floorMin: "",
  floorMax: "",
  unitInFloor: "",
  unitInComplex: "",
  floorStart: "",
  usageType: "",
  documentType: "",
  buildLicense: "",
  positionType: "",
  geography: "",
  facilities: "",
  conditions: "",
  createFrom: "",
  createTo: "",
  showFrom: "",
  showTo: "",
  deliveryFrom: "",
  deliveryTo: "",
  photo: "",
  video: "",
  vr: "",
  urgent: "",
  keynot: "",
  oneBuilding: "",
  separateVilla: "",
  exchange: "",
  existingDocument: "",
  divar: "",
  isExpire: "",
  favorite: "",
  myExpert: "",
  order: "",
  orderBy: "",
  perPage: "",
};

export type PanelEstateAction =
  | "archive"
  | "restore"
  | "publish"
  | "ladder"
  | "delete"
  | "notify-owner"
  | "absence";
