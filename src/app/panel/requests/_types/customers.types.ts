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
  district_id?: string | readonly (string | number)[];
  area_min?: number;
  area_max?: number;
  price_min?: number;
  price_max?: number;
  page?: number;
  per_page?: number;
};

export type CustomerFilters = {
  query: string;
  requestType: string;
  status: string;
  estateType: string;
  agent: string;
};

export const defaultCustomerFilters: CustomerFilters = {
  query: "",
  requestType: "1",
  status: "",
  estateType: "",
  agent: "",
};
