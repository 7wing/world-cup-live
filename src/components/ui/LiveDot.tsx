export function LiveDot() {
  return (
    <span className="relative inline-flex w-[7px] h-[7px] shrink-0">
      <span className="absolute inset-0 rounded-full bg-primary-container animate-ping opacity-75" />
      <span className="relative w-[7px] h-[7px] rounded-full bg-primary-container" />
    </span>
  )
}