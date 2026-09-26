import {
  defaultShouldDehydrateQuery,
  QueryClient,
  QueryCache,
} from "@tanstack/react-query";
import { getLogger } from "@/lib/logging";

export function getServerQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const queryKey = Array.isArray(query.queryKey)
          ? query.queryKey.map(String).join("·")
          : String(query.queryKey);
        const feature = String(query.queryKey[0] ?? "unknown");
        const logger = getLogger(["query", feature]);
        logger.error("Server query failed: {queryKey}", {
          queryKey,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        });
      },
      onSuccess: (_data, query) => {
        const queryKey = Array.isArray(query.queryKey)
          ? query.queryKey.map(String).join("·")
          : String(query.queryKey);
        const feature = String(query.queryKey[0] ?? "unknown");
        const logger = getLogger(["query", feature]);
        logger.debug("Server query completed: {queryKey}", { queryKey });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 300000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}
