import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { getLogger } from "@/lib/logging";

let queryClient: QueryClient;

export function getClientQueryClient() {
  queryClient =
    queryClient ??
    new QueryClient({
      queryCache: new QueryCache({
        onError: (error, query) => {
          const queryKey = Array.isArray(query.queryKey)
            ? query.queryKey.map(String).join("·")
            : String(query.queryKey);
          const feature = String(query.queryKey[0] ?? "unknown");
          const logger = getLogger(["query", feature]);
          logger.error("Query failed: {queryKey}", {
            queryKey,
            errorMessage:
              error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
          });
        },
        onSuccess: (_data, query) => {
          const queryKey = Array.isArray(query.queryKey)
            ? query.queryKey.map(String).join("·")
            : String(query.queryKey);
          const feature = String(query.queryKey[0] ?? "unknown");
          const logger = getLogger(["query", feature]);
          logger.debug("Query completed: {queryKey}", { queryKey });
        },
      }),
      mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) => {
          const mutationKey = mutation.options.mutationKey
            ? Array.isArray(mutation.options.mutationKey)
              ? mutation.options.mutationKey.map(String).join("·")
              : String(mutation.options.mutationKey)
            : "unnamed";
          const feature = mutation.options.mutationKey?.[0]
            ? String(mutation.options.mutationKey[0])
            : "unknown";
          const logger = getLogger(["mutation", feature]);
          logger.error("Mutation failed: {mutationKey}", {
            mutationKey,
            errorMessage:
              error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
          });
        },
      }),
      defaultOptions: {
        queries: {
          staleTime: 300000,
        },
      },
    });

  return queryClient;
}
