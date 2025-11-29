import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  const migrationPath = path.join(
    process.cwd(),
    "supabase/migrations/007_allow_public_username_read.sql"
  );
  const sql = fs.readFileSync(migrationPath, "utf-8");

  console.log("Applying migration 007...");
  const { error } = await supabase.rpc("exec_sql", { sql_string: sql });

  if (error) {
    // Try direct query if RPC doesn't exist
    console.log("RPC failed, trying direct query...");
    const lines = sql
      .split(";")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("--"));

    for (const query of lines) {
      if (query) {
        console.log(`Executing: ${query.substring(0, 50)}...`);
        const { error: queryError } = await supabase.rpc("exec", {
          query,
        });

        if (queryError) {
          console.error("Query error:", queryError);
          // Try direct SQL execution via auth admin
          const result = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: "POST",
            headers: {
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          });

          if (!result.ok) {
            console.error("HTTP error:", await result.text());
          }
        }
      }
    }
  }

  console.log("✅ Migration applied successfully");
}

applyMigration().catch(console.error);
