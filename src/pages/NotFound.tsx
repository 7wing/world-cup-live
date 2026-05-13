import { Link } from 'react-router-dom'
import { NeonButton } from '@/components/ui/NeonButton'

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-5">
      <h1 className="font-lexend font-black text-8xl text-primary-container neon-text">404</h1>
      <p className="font-lexend font-bold text-2xl uppercase text-white">You're offside.</p>
      <p className="text-white/60">This page doesn't exist. Get back in the game.</p>
      <Link to="/matches">
        <NeonButton size="lg">Back to Matches</NeonButton>
      </Link>
    </div>
  )
}