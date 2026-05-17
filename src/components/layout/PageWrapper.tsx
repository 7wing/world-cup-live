interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <main className={`pt-20 pb-32 md:pb-16 px-5 max-w-[1440px] mx-auto min-h-screen w-full overflow-x-hidden ${className}`}>
      {children}
    </main>
  )
}