import { createClient } from "@supabase/supabase-js";
import { Database } from "../supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL environment variable is not set. Please check your .env.local file."
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY environment variable is not set. Please check your .env.local file."
  );
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Connection: "keep-alive",
      },
    },
    db: {
      schema: "public",
    },
    // Add timeout and retry configuration
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Utility function for retrying database operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error = new Error("Operation failed after maximum retries");

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain types of errors
      if (
        error instanceof Error &&
        (error.message.includes("Row level security") ||
          error.message.includes("Permission denied") ||
          error.message.includes("Invalid API key"))
      ) {
        throw error;
      }

      if (attempt === maxRetries) {
        console.error(`Operation failed after ${maxRetries} attempts:`, error);
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = delayMs * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.warn(
        `Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(
          delay
        )}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Database health check function
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  message: string;
  responseTime?: number;
}> {
  const startTime = Date.now();

  try {
    // Simple query to test database connectivity
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("count")
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        isHealthy: false,
        message: `Database error: ${error.message}`,
        responseTime,
      };
    }

    return {
      isHealthy: true,
      message: "Database connection is healthy",
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      isHealthy: false,
      message: `Connection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      responseTime,
    };
  }
}
