import { supabase } from '@/lib/supabase'
import type { Stadium, StadiumReview, FanPhoto } from '@/types'

function assertSupabaseConfigured() {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured (missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)')
  }
}

const FETCH_TIMEOUT_MS = 12_000

export async function fetchStadiums(): Promise<Stadium[]> {
  assertSupabaseConfigured()

  const fetchPromise = (async () => {
    const { data, error } = await supabase
      .from('stadiums')
      .select('*')
      .order('avg_rating', { ascending: false })

    if (error) {
      console.error('[fetchStadiums]', error.message, error.code)
      throw new Error(error.message || 'Failed to load stadiums')
    }
    return (data ?? []) as Stadium[]
  })()

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error('Stadiums request timed out. Check your network and Supabase config.')),
      FETCH_TIMEOUT_MS
    )
  })

  return Promise.race([fetchPromise, timeout])
}

export async function fetchStadiumById(slug: string): Promise<Stadium> {
  const { data, error } = await supabase
    .from('stadiums')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as Stadium
}

export async function fetchStadiumReviews(stadiumId: string): Promise<StadiumReview[]> {
  const { data, error } = await supabase
    .from('stadium_reviews')
    .select('*, user:users(username, avatar_url)')
    .eq('stadium_id', stadiumId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as StadiumReview[]
}

export async function submitStadiumReview(
  review: Omit<StadiumReview, 'id' | 'created_at' | 'overall_rating' | 'user'>
): Promise<void> {
  const { error } = await supabase.from('stadium_reviews').insert(review)
  if (error) throw error
}

export async function fetchStadiumPhotos(stadiumId: string): Promise<FanPhoto[]> {
  const { data, error } = await supabase
    .from('fan_photos')
    .select('*, user:users(username, avatar_url)')
    .eq('stadium_id', stadiumId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as FanPhoto[]
}

export async function uploadFanPhoto(
  userId: string,
  stadiumId: string,
  file: File,
  caption: string
): Promise<void> {
  const path = `${userId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('fan-photos')
    .upload(path, file)

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from('fan-photos').getPublicUrl(path)

  const { error: insertError } = await supabase.from('fan_photos').insert({
    user_id: userId,
    stadium_id: stadiumId,
    image_url: urlData.publicUrl,
    caption,
  })

  if (insertError) {
    // Attempt to clean up the orphaned storage file
    await supabase.storage.from('fan-photos').remove([path])
    throw insertError
  }
}