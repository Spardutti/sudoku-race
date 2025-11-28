import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { Header } from "./Header";
import { createServerClient } from "@/lib/supabase/server";

export async function HeaderWithAuth() {
  const userId = await getCurrentUserId();

  let username: string | null = null;

  if (userId) {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("users")
      .select("username")
      .eq("id", userId)
      .single();

    username = data?.username || null;
  }

  return <Header userId={userId} username={username} />;
}
