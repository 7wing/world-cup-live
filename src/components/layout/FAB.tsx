interface FABProps {
  icon: string
  onClick: () => void
  label?: string
}

export function FAB({ icon, onClick, label }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-primary-container text-on-primary rounded-full shadow-[0_0_20px_rgba(0,255,65,0.4)] flex items-center justify-center active:scale-95 transition-transform z-40"
      aria-label={label}
    >
      <span className="material-symbols-outlined text-3xl">{icon}</span>
    </button>
  )
}