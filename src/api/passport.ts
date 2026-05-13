import { supabase } from '@/lib/supabase'
import type { PassportBadge, Prediction } from '@/types'

export async function fetchUserBadges(userId: string): Promise<PassportBadge[]> {
  const { data, error } = await supabase
    .from('passport_badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) throw error
  return data as PassportBadge[]
}

export async function fetchPredictionHistory(userId: string): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Prediction[]
}

export async function submitPrediction(
  pred: Pick<Prediction, 'user_id' | 'match_id' | 'predicted_home' | 'predicted_away'>
): Promise<void> {
  const { error } = await supabase
    .from('predictions')
    .upsert(pred, { onConflict: 'user_id,match_id' })

  if (error) throw error
}