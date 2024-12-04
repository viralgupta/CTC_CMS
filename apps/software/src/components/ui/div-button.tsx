import { cn } from '@/lib/utils'
import React from 'react'

const DivButton = ({
  children,
  className,
  onClick,
  disabled
}: {
  children: React.ReactNode
  className?: string,
  onClick?: () => void
  disabled?: boolean
}) => {
  return (
    <div onClick={onClick} className={cn(`bg-background ${disabled ? "opacity-50 pointer-events-none" : "hover:bg-accent hover:text-accent-foreground cursor-pointer"} rounded-md` , className)}>
      {children}
    </div>
  )
}

export default DivButton;