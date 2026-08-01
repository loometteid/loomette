import { redirect } from "next/navigation";
import { EditProfileForm } from "@/components/features/profile/edit-profile-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("user")
    .select(
      "username, display_name, profile_photo, birthday, gender, occupation, work_setting, outfit_size, shoe_size, shoe_size_region, height, weight, bust_size, waist_size, high_hip_size, hip_size, body_type, style_tags",
    )
    .eq("user_id", user.id)
    .single();

  if (!profile) return null;

  return <EditProfileForm profile={profile} />;
}
