import React from 'react'

interface ButtonProps {
  children?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  onClick?: () => void
}

export function Button({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  onClick
}: ButtonProps) {
  const baseClasses = 'rounded-md px-3 py-2 text-sm font-medium transition-colors'
  const variantClasses = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
  }
  const sizeClasses = {
    default: 'px-4 py-2',
    sm: 'px-2 py-1 text-xs',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
} 