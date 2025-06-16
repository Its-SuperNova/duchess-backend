"use client"

import { useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function DebugInfo() {
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const supabase = getSupabaseBrowserClient()

  const checkConnection = async () => {
    try {
      // Check if we can connect to Supabase
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      // Get environment variables (only public ones)
      const envInfo = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        // Don't show the full key, just the first few characters
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5)}...`
          : undefined,
      }

      setDebugInfo({
        connection: error ? "Failed" : "Success",
        error: error ? error.message : null,
        data,
        env: envInfo,
      })
    } catch (err: any) {
      setDebugInfo({
        connection: "Error",
        error: err.message,
      })
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (!showDebug) {
            checkConnection()
          }
          setShowDebug(!showDebug)
        }}
      >
        {showDebug ? "Hide Debug" : "Debug"}
      </Button>

      {showDebug && (
        <div className="mt-2 p-4 bg-white border rounded-md shadow-lg max-w-md">
          <h3 className="font-bold">Debug Information</h3>
          <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-60">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          <Button size="sm" className="mt-2" onClick={checkConnection}>
            Refresh
          </Button>
        </div>
      )}
    </div>
  )
}
