export type PanelEstateParams = {
  id?: number;
  type?: 1 | 2;
  estateTypes?: number;
  confirmation?: string;
  visibility?: 0 | 1;
  city_id?: number;
  district_id?: string | readonly (string | number)[];
  user_id?: number;
  expert_type?: number;
  title?: string;
  name?: string;
  username?: string;
  minArea?: number;
  maxArea?: number;
  room_count?: number;
  price?: string;
  mortgage?: string;
  rent?: string;
  page?: number;
  per_page?: number;
};

export type PanelEstateFilters = {
  query: string;
  confirmation: string;
  dealType: string;
  estateType: string;
  visibility: string;
  expert: string;
};

export const defaultPanelEstateFilters: PanelEstateFilters = {
  query: "",
  confirmation: "",
  dealType: "",
  estateType: "",
  visibility: "",
  expert: "",
};

export type PanelEstateAction =
  | "archive"
  | "restore"
  | "publish"
  | "ladder"
  | "delete"
  | "notify-owner"
  | "absence";
