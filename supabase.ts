import { SUPABASE_ANON_PUBLIC, SUPABASE_URL } from '@env'
import { createClient } from '@supabase/supabase-js'

export const client = createClient(SUPABASE_URL, SUPABASE_ANON_PUBLIC)
