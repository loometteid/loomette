import { getLogger } from "@/lib/logging";
import { defaultShouldDehydrateQuery, MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient;

function getQueryCache(environment: 'Client' | 'Server') {
  return new QueryCache({
    onError: (error, query) => {
      const queryKey = Array.isArray(query.queryKey)
        ? query.queryKey.map(String).join("·")
        : String(query.queryKey);
      const feature = String(query.queryKey[0] ?? "unknown");
      const logger = getLogger(["query", feature]);
      logger.error("{environment} query failed: {queryKey}", {
        queryKey,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        environment
      });
    },
    onSuccess: (_data, query) => {
      const queryKey = Array.isArray(query.queryKey)
        ? query.queryKey.map(String).join("·")
        : String(query.queryKey);
      const feature = String(query.queryKey[0] ?? "unknown");
      const logger = getLogger(["query", feature]);
      logger.debug("{environment} query completed: {queryKey}", { queryKey, environment });
    },
  })
}

function getMutationCache() {
  return new MutationCache({
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
  })
}

export function getQueryClient() {
  if (typeof window === "undefined") {
    return new QueryClient({
      queryCache: getQueryCache('Server'),
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

  queryClient =
    queryClient ??
    new QueryClient({
      queryCache: getQueryCache('Client'),
      mutationCache: getMutationCache(),
      defaultOptions: {
        queries: {
          staleTime: 300000,
        },
      },
    });

  return queryClient;
}
