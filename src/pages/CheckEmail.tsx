import { useLocation, useNavigate, Link } from 'react-router-dom'
import { NeonButton } from '@/components/ui/NeonButton'

export function CheckEmailPage() {
  const { state } = useLocation() as { state?: { email?: string } }
  const navigate  = useNavigate()
  const email     = state?.email

  return (
    <div
      className="
        min-h-[100dvh]
        flex flex-col items-center justify-center
        px-4 sm:px-6
        pt-[calc(5rem+env(safe-area-inset-top,0px))]
        lg:pt-24
        pb-[calc(7rem+env(safe-area-inset-bottom,0px))]
        lg:pb-12
      "
    >
      <div className="w-full max-w-sm">
        <div className="glass-card p-6 sm:p-8 rounded-2xl text-center space-y-5">

          {/* Icon */}
          <div className="mx-auto w-14 h-14 rounded-full bg-primary-container/20 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-primary-container"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div>
            <h2 className="font-lexend font-bold text-xl sm:text-2xl mb-1">
              Check your inbox
            </h2>
            <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
              We sent a confirmation link to{' '}
              {email
                ? <span className="text-white font-semibold">{email}</span>
                : 'your email address'
              }.
              Click it to activate your account.
            </p>
          </div>

          <p className="text-white/30 text-[11px] leading-relaxed">
            Didn't receive it? Check your spam folder. The link expires in 1 hour —
            if it's gone,{' '}
            <button
              type="button"
              onClick={() => navigate('/signup', { replace: true })}
              className="text-primary-container underline underline-offset-2"
            >
              sign up again
            </button>
            {' '}with the same email to get a fresh one.
          </p>

          <NeonButton
            type="button"
            variant="outline"
            className="w-full justify-center"
            onClick={() => navigate('/login', { replace: true })}
          >
            Go to Login
          </NeonButton>

          <p className="text-white/30 text-[11px]">
            Already confirmed?{' '}
            <Link
              to="/login"
              className="text-primary-container underline underline-offset-2"
            >
              Log in now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}