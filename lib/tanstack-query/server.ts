import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";

export function getServerQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 300
			},
			dehydrate: {
				shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === "pending"
			}
		}
	})
}