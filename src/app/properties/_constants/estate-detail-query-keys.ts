export const estateDetailQueryKeys = {
  all: ["estate-detail"] as const,
  detail: (id: string | number) =>
    [...estateDetailQueryKeys.all, "detail", String(id)] as const,
  contact: (id: string | number) =>
    [...estateDetailQueryKeys.all, "contact", String(id)] as const,
  similar: (id: string | number) =>
    [...estateDetailQueryKeys.all, "similar", String(id)] as const,
};
