export const chatQueryKeys = {
  all: ["chats"] as const,
  list: () => [...chatQueryKeys.all, "list"] as const,
  detail: (id: number) => [...chatQueryKeys.all, "detail", id] as const,
  unread: () => [...chatQueryKeys.all, "unread"] as const,
  contacts: () => [...chatQueryKeys.all, "contacts"] as const,
  estate: (estateId: number) =>
    [...chatQueryKeys.all, "estate", estateId] as const,
};
