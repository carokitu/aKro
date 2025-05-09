import AsyncStorage from '@react-native-async-storage/async-storage'

import { createClient } from '@supabase/supabase-js'

export const client = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL as string,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_PUBLIC as string,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false, // indispensable pour React Native
      persistSession: true,
      storage: AsyncStorage,
    },
  },
)
