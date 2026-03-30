import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key'

// Client Supabase pour le côté client et serveur
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type helper pour les réponses Supabase
export type SupabaseResponse<T> = {
  data: T | null
  error: Error | null
}

// Client pour le côté serveur avec la clé service_role (admin)
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return createClient(supabaseUrl, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
