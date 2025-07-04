import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : "Not set",
    allEnvVars: Object.keys(process.env).filter(
      (key) => key.includes("GOOGLE") || key.includes("MAPS")
    ),
  });
}
