export const smsQueryKeys = {
  all: ["sms"] as const,
  groups: () => [...smsQueryKeys.all, "groups"] as const,
  contacts: (query: string) => [...smsQueryKeys.all, "contacts", query] as const,
  templates: () => [...smsQueryKeys.all, "templates"] as const,
  history: () => [...smsQueryKeys.all, "history"] as const,
};
