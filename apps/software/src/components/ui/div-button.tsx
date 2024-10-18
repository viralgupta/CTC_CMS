import { cn } from '@/lib/utils'
import React from 'react'

const DivButton = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string,
  onClick?: () => void
}) => {
  return (
    <div onClick={onClick} className={cn("bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md", className)}>
      {children}
    </div>
  )
}

export default DivButton;