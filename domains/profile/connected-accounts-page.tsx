"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { ProfileBreadcrumb } from "./components/profile-breadcrumb";
import { getUserQueryOptions } from "./query-options/get-user.query-option";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { UserIdentity } from "@supabase/supabase-js";

interface ProviderAccount {
  id: "google" | "facebook" | "x";
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  emailOrHandle?: string;
}

export interface ConnectedAccountsUser {
  id?: string;
  email?: string | null;
  app_metadata?: {
    provider?: string;
    providers?: string[];
    [key: string]: unknown;
  };
  identities?: UserIdentity[];
}

export function ConnectedAccountsView({
  initialUser,
}: {
  initialUser?: ConnectedAccountsUser | null;
} = {}) {
  const router = useRouter();
  const queryResult = useQuery({
    ...getUserQueryOptions(),
    enabled: !initialUser,
  });
  const user = initialUser ?? queryResult.data;
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // Check linked identities / providers from user metadata
  const identities = (user?.identities ?? []) as UserIdentity[];
  const hasGoogle =
    identities.some((id) => id.provider === "google") ||
    user?.app_metadata?.provider === "google" ||
    (user?.app_metadata?.providers as string[] | undefined)?.includes("google") ||
    !!user?.email?.endsWith("@gmail.com");

  const hasFacebook =
    identities.some((id) => id.provider === "facebook") ||
    user?.app_metadata?.provider === "facebook" ||
    (user?.app_metadata?.providers as string[] | undefined)?.includes("facebook");

  const hasTwitter =
    identities.some((id) => id.provider === "twitter" || id.provider === "x") ||
    user?.app_metadata?.provider === "twitter" ||
    (user?.app_metadata?.providers as string[] | undefined)?.includes("twitter");

  const providers: ProviderAccount[] = [
    {
      id: "google",
      name: "Google",
      connected: Boolean(hasGoogle),
      emailOrHandle: hasGoogle ? (user?.email ?? "hello@gmail.com") : undefined,
      icon: (
        <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      ),
    },
    {
      id: "facebook",
      name: "Facebook",
      connected: Boolean(hasFacebook),
      emailOrHandle: hasFacebook ? (user?.email ?? undefined) : undefined,
      icon: (
        <svg viewBox="0 0 24 24" className="size-6 shrink-0 fill-[#1877F2]" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      id: "x",
      name: "X",
      connected: Boolean(hasTwitter),
      emailOrHandle: hasTwitter ? (user?.email ?? undefined) : undefined,
      icon: (
        <div className="size-6 rounded-md bg-black flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="size-3.5 fill-white" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
      ),
    },
  ];

  async function handleToggleAccount(provider: ProviderAccount) {
    if (provider.connected) {
      // Disconnecting
      if (providers.filter((p) => p.connected).length <= 1) {
        toast.error("You cannot disconnect your only sign-in method.");
        return;
      }

      try {
        setLoadingProvider(provider.id);
        const supabase = createBrowserSupabaseClient();
        const targetIdentity = identities.find((id) =>
          provider.id === "x" ? id.provider === "twitter" : id.provider === provider.id,
        );

        if (targetIdentity) {
          const { error } = await supabase.auth.unlinkIdentity(targetIdentity);
          if (error) throw error;
        }
        toast.success(`Disconnected ${provider.name} account.`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : `Failed to disconnect ${provider.name}.`);
      } finally {
        setLoadingProvider(null);
      }
    } else {
      // Connecting
      try {
        setLoadingProvider(provider.id);
        const supabase = createBrowserSupabaseClient();
        const oauthProvider = provider.id === "x" ? "twitter" : provider.id;

        const { error } = await supabase.auth.linkIdentity({
          provider: oauthProvider,
          options: {
            redirectTo: `${window.location.origin}/profile/settings/connected-accounts`,
          },
        });

        if (error) {
          // If provider not configured in Supabase yet, give helpful user feedback
          toast.info(`${provider.name} OAuth integration is pending dashboard setup.`);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : `Failed to connect ${provider.name}.`);
      } finally {
        setLoadingProvider(null);
      }
    }
  }

  return (
    <main
      className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12"
      data-testid="connected-accounts"
    >
      {/* Desktop Breadcrumb */}
      <ProfileBreadcrumb
        items={[
          { label: "PROFILE", href: "/profile" },
          { label: "SETTINGS", href: "/profile/settings" },
          { label: "CONNECTED ACCOUNT" },
        ]}
      />

      {/* Mobile back button */}
      <div className="flex items-center justify-between lg:hidden">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-xl"
          onClick={() => router.back()}
          aria-label="Go back"
          data-testid="connected-accounts__back-button"
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      {/* Header title */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Sparkle className="size-6 text-foreground" />
          <Typography
            variant="title"
            as="h1"
            className="font-serif text-[32px] md:text-4xl font-normal text-foreground leading-tight"
            data-testid="connected-accounts__title"
          >
            Connected Account
          </Typography>
        </div>
        <Typography
          variant="subtitle"
          className="font-sans text-xs font-normal uppercase tracking-wider text-muted-foreground max-w-xl leading-relaxed"
        >
          Link your accounts to log in faster. We only use these to verify it&apos;s you — nothing else.
        </Typography>
      </div>

      {/* Accounts List */}
      <div className="flex flex-col gap-6 max-w-xl pt-4">
        {providers.map((provider) => {
          const isPending = loadingProvider === provider.id;
          return (
            <div
              key={provider.id}
              data-testid="connected-accounts__item"
              data-entity-id={provider.id}
              className="flex items-center justify-between gap-4 py-2"
            >
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl border border-[#EAE4DC] bg-white flex items-center justify-center shadow-2xs shrink-0">
                  {provider.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-base font-normal text-foreground leading-tight">
                    {provider.name}
                  </span>
                  {provider.connected ? (
                    <span className="font-sans text-xs font-normal text-muted-foreground flex items-center gap-1.5">
                      <span className="text-[8px] text-muted-foreground">●</span>
                      <span>{provider.emailOrHandle}</span>
                    </span>
                  ) : (
                    <span className="font-sans text-xs font-normal text-muted-foreground">
                      Not connected
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => void handleToggleAccount(provider)}
                data-testid={`connected-accounts__${provider.id}-toggle`}
                className="rounded-full border border-[#C9C3B7] px-6 py-2 font-sans text-xs font-normal uppercase tracking-wider text-[#444440] hover:bg-[#F2EDE5]/60 transition-colors disabled:opacity-50 shrink-0"
              >
                {isPending
                  ? "…"
                  : provider.connected
                    ? "Disconnect"
                    : "Connect"}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
