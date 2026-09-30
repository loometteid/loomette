import type { Database } from "@/types/database.types";

export type UserProfile = Database["public"]["Tables"]["user"]["Row"];

export type FavoriteEntry = {
  id: string;
  name: string | null;
  image_url: string | null;
};

export type WishlistEntry = {
  id: string;
  name: string | null;
  image_url: string | null;
};

export type WishlistRow = {
  id: string;
  item: {
    name: string | null;
    image_url: string | null;
  } | null;
};
