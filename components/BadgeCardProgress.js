// src/components/BadgeCardProgress.js

import * as React from 'react'
import { cn } from '../lib/utils'
import { cva } from 'class-variance-authority'
import * as ProgressPrimitive from '@radix-ui/react-progress'

// ---------------------------------------------
// 1) CARD COMPONENTS (Dark Theme Default)
// ---------------------------------------------
const Card = React.forwardRef(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        // Dark background card + subtle border + light text
        'rounded-xl border border-gray-700 bg-gray-900 text-gray-100 shadow-sm',
        className
      )}
      {...props}
    />
  )
})
Card.displayName = 'Card'

const CardHeader = React.forwardRef(function CardHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-2 p-6', className)}
      {...props}
    />
  )
})
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(function CardTitle({ className, ...props }, ref) {
  return (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold tracking-tight', className)}
      {...props}
    />
  )
})
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef(function CardDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-gray-400', className)}
      {...props}
    />
  )
})
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef(function CardContent({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  )
})
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(function CardFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
})
CardFooter.displayName = 'CardFooter'

// ---------------------------------------------
// 2) BADGE COMPONENT (Dark Theme Variants)
// ---------------------------------------------
const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900', // base
  {
    variants: {
      variant: {
        default: cn(
          'border-transparent bg-indigo-600 text-white hover:bg-indigo-500'
        ),
        secondary: cn(
          'border-transparent bg-gray-800 text-gray-300 hover:bg-gray-700'
        ),
        destructive: cn(
          'border-transparent bg-red-600 text-white hover:bg-red-500'
        ),
        outline: cn(
          'bg-transparent text-gray-100 border-gray-600 hover:bg-gray-800'
        ),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Badge = React.forwardRef(function Badge({ className, variant, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
})
Badge.displayName = 'Badge'

// ---------------------------------------------
// 3) PROGRESS COMPONENT (Dark Theme)
// ---------------------------------------------
const Progress = React.forwardRef(function Progress({ className, value, ...props }, ref) {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        // Track color
        'relative h-2 w-full overflow-hidden rounded-full bg-gray-700',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full bg-indigo-500 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = 'Progress'

// ---------------------------------------------
// 4) EXPORT ALL IN ONE
// ---------------------------------------------
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Progress,
}