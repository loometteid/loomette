import { ProfileView } from "@/components/features/profile/profile-view";
import type {
  FavoriteEntry,
  WishlistEntry,
} from "@/components/features/profile/types";
import type { Trip } from "@/components/features/trip/types";
import { createClient } from "@/lib/supabase/server";

type WishlistRow = {
  id: string;
  item: {
    name: string | null;
    image_url: string | null;
  } | null;
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [
    { data: profile },
    { data: favoriteOutfits },
    { data: wishlistRows },
    { data: trips },
  ] = await Promise.all([
    supabase
      .from("user")
      .select("username, display_name, profile_photo, outfit_size, shoe_size")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("outfit")
      .select("id, name, cover_image_url")
      .eq("user_id", user.id)
      .eq("is_saved", true)
      .order("added_at", { ascending: false }),
    supabase
      .from("wardrobe_item")
      .select("id, item:item_id(name, image_url)")
      .eq("user_id", user.id)
      .eq("is_wishlist", true)
      .returns<WishlistRow[]>(),
    supabase
      .from("trip")
      .select("id, name, start_date, end_date, season, travel_companion")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .returns<Trip[]>(),
  ]);

  const favorites: FavoriteEntry[] = (favoriteOutfits ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    image_url: row.cover_image_url,
  }));

  const wishlist: WishlistEntry[] = (wishlistRows ?? []).map((row) => ({
    id: row.id,
    name: row.item?.name ?? null,
    image_url: row.item?.image_url ?? null,
  }));

  return (
    <ProfileView
      username={profile?.username ?? user.email?.split("@")[0] ?? "you"}
      displayName={profile?.display_name ?? null}
      profilePhoto={profile?.profile_photo ?? null}
      outfitSize={profile?.outfit_size ?? null}
      shoeSize={profile?.shoe_size ?? null}
      favorites={favorites}
      wishlist={wishlist}
      trips={trips ?? []}
    />
  );
}
