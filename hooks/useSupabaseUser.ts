import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
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

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .single();

        if (error) {
          setError(error.message);
          setUser(null);
        } else {
          setUser(data);
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
