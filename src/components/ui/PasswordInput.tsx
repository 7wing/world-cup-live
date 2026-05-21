import { useState } from 'react'
import { cn } from '@/utils/cn'

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export function PasswordInput({ label, className, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="font-lexend text-[10px] uppercase text-outline font-semibold block mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={cn(
            'auth-input w-full pr-10',
            className
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-primary-container transition-colors"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {visible ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  )
}
