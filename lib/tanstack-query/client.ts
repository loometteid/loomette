import { QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient;

export function getClientQueryClient() {
  queryClient = queryClient ?? new QueryClient();

  return queryClient;
}