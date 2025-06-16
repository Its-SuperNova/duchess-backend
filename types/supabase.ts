export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          last_sign_in_at: string | null
          email: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          last_sign_in_at?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          last_sign_in_at?: string | null
          email?: string | null
        }
      }
    }
  }
}
