import { createBrowserClient } from '@supabase/ssr'

// Factory: chiamare all'interno dei componenti, non a livello modulo
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
