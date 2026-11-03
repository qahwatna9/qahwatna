import { createClient } from '@supabase/supabase-js'

// Only the public anon key is used here. Never put the service_role key in this project.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const money = (n) => `${Number(n).toLocaleString('ar-EG')} ج.م`
