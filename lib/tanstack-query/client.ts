import { QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient;

export function getClientQueryClient() {
  queryClient = queryClient ?? new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 300000
      }
    }
  });

  return queryClient;
}
