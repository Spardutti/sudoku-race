import { Header } from "./Header";
import { createServerClient } from "@/lib/supabase/server";

export async function HeaderWithAuth() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;

  if (user) {
    const { data } = await supabase
      .from("users")
      .select("username")
      .eq("id", user.id)
      .single();

    username = data?.username || null;
  }

  return <Header initialUser={user} username={username} />;
}
