import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixUsersRLS() {
  console.log("Fixing users table RLS for leaderboard...");

  // Drop old policy
  const dropQuery = `DROP POLICY IF EXISTS "Users can read own data" ON users;`;

  // Create new policy
  const createQuery = `CREATE POLICY "Usernames are publicly readable" ON users FOR SELECT USING (true);`;

  try {
    // Execute via direct postgres connection string would be ideal
    // For now, let's just log the queries
    console.log("\nExecute these SQL commands in Supabase SQL Editor:\n");
    console.log(dropQuery);
    console.log(createQuery);
    console.log("\nOr apply via dashboard: https://supabase.com/dashboard/project/_/sql");
  } catch (error) {
    console.error("Error:", error);
  }
}

fixUsersRLS();
