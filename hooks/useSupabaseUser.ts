import { useState, useEffect } from "react";
import { supabaseAdmin } from "../lib/supabase/admin";
import type { User } from "../lib/supabase";

export function useSupabaseUser(email: string | null) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!email) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use admin client to bypass RLS for user queries
        const { data, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", email as any)
          .single();

        if (error) {
          setError(error.message);
          setUser(null);
        } else {
          setUser(data as any);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [email]);

  return { user, loading, error };
}
