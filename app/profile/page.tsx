import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { createServerClient } from "@/lib/supabase/server";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

export default async function ProfilePage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/?message=Please sign in to view your profile");
  }

  const supabase = await createServerClient();

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("username, email, created_at, oauth_provider")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    redirect("/?message=Failed to load profile");
  }

  const { count: completionCount } = await supabase
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  return (
    <ProfilePageClient
      user={{
        id: userId,
        username: userData.username,
        email: userData.email,
        createdAt: userData.created_at,
        oauthProvider: userData.oauth_provider,
      }}
      stats={{
        totalPuzzlesSolved: completionCount ?? 0,
      }}
    />
  );
}
