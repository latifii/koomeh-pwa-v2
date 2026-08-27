export const estateStaffQueryKeys = {
  all: ["estate-staff"] as const,
  management: (id: number) =>
    [...estateStaffQueryKeys.all, "management", id] as const,
  matchedCustomers: (id: number, page: number) =>
    [...estateStaffQueryKeys.all, "matched-customers", id, page] as const,
  appointments: (id: number, page: number) =>
    [...estateStaffQueryKeys.all, "appointments", id, page] as const,
  ownerEstates: (id: number, page: number) =>
    [...estateStaffQueryKeys.all, "owner-estates", id, page] as const,
  editHistory: (id: number) =>
    [...estateStaffQueryKeys.all, "edit-history", id] as const,
  operations: (id: number, page: number) =>
    [...estateStaffQueryKeys.all, "operations", id, page] as const,
  operationTypes: () => [...estateStaffQueryKeys.all, "operation-types"] as const,
};
