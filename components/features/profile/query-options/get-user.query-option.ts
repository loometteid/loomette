import { createClient } from "@/lib/supabase/client";
import { queryOptions } from "@tanstack/react-query";
import { redirect } from "next/navigation";

export const getUserQueryOptions = () =>
  queryOptions({
    queryKey: ["auth", "user"] as const,
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      console.log({ error, user })
      if (error || !user) {
        throw redirect("/sign-in");
      }
      return user;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
