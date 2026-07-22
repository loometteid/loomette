import { notFound, redirect } from "next/navigation";
import { EditItemForm } from "@/components/features/wardrobe/edit-item-form";
import { createClient } from "@/lib/supabase/server";
import type { PendingItem } from "@/components/features/wardrobe/types";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [{ data: row }, { data: profile }] = await Promise.all([
    supabase
      .from("wardrobe_item")
      .select(
        "id, created_at, size, price, purchase_location, occasions, image_url, item:item_id(item_id, name, category, subcategory, brand, color, image_url)",
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single()
      .returns<PendingItem>(),
    supabase.from("user").select("gender").eq("user_id", user.id).single(),
  ]);

  if (!row) {
    notFound();
  }

  return <EditItemForm item={row} gender={profile?.gender ?? null} />;
}
