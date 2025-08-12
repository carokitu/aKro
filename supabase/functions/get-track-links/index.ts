import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string)

export const getTrackLinks = async (isrc: string) => {
  try {
    const odesliUrl = `https://api.song.link/v1-alpha.1/links?isrc=${encodeURIComponent(isrc)}`
    const res = await fetch(odesliUrl)

    if (!res.ok) {
      throw new Error(`Odesli API error: ${res.statusText}`)
    }

    const data = await res.json()

    const platformLinks: Record<string, string> = {}
    for (const [platform, info] of Object.entries(data.linksByPlatform)) {
      platformLinks[platform] = (info as unknown as { url: string }).url
    }

    const { error } = await supabase.from('tracks').update({ platform_links: platformLinks }).eq('isrc', isrc)

    if (error) {
      throw error
    }

    console.log(`✅ Updated track ${isrc} with platform links`)
    return platformLinks
  } catch (err) {
    console.error('❌ Error updating platform links:', err)
    throw err
  }
}
