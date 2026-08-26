export type AgentsSearchParams = {
  name?: string;
  city_id?: number;
  all?: boolean;
  districts?: string | readonly (string | number)[];
  branch_id?: number;
  activity_type?: 1 | 2;
  estate_types?: string | readonly (string | number)[];
  language?: number;
  gender?: "male" | "female";
  experience?: number;
  has_estates?: boolean;
  sort?: 1 | 2 | 3 | 4;
  page?: number;
  per_page?: number;
};

export type AgentEstatesParams = {
  type?: 1 | 2;
  page?: number;
  per_page?: number;
};

export type AgentRequestOptions = {
  signal?: AbortSignal;
};
