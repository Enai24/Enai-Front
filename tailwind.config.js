/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'], // Enables dark mode support
  content: [
    './src/**/*.js',
    './src/**/*.jsx',
    './public/index.html',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        // Background colors for light and dark modes
        background: {
          DEFAULT: 'hsl(var(--background))',
          dark: '#18181b', // Dark mode background
          light: '#ffffff', // Light mode background
        },
        // Foreground text colors
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          dark: '#e2e8f0', // Text in dark mode
          light: '#1a202c', // Text in light mode
        },
        // Card colors for UI components
        card: {
          DEFAULT: 'hsl(var(--card))',
          dark: '#1f2937', // Dark mode cards
          light: '#f8f9fa', // Light mode cards
        },
        // Primary action colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          dark: '#2563eb', // Dark mode primary color
          light: '#1d4ed8', // Light mode primary color
        },
        // Muted colors for borders and placeholders
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          dark: '#6b7280', // Muted color in dark mode
          light: '#9ca3af', // Muted color in light mode
        },
        // Border colors for consistency across themes
        border: {
          DEFAULT: 'hsl(var(--border))',
          dark: '#374151', // Dark mode border
          light: '#e5e7eb', // Light mode border
        },
        // Input fields
        input: {
          DEFAULT: 'hsl(var(--input))',
          dark: '#111827', // Dark mode input background
          light: '#f9fafb', // Light mode input background
        },
        // Accent colors for interactive elements
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          dark: '#3b82f6', // Dark mode accent
          light: '#2563eb', // Light mode accent
        },
        // Destructive colors for delete buttons or warnings
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          dark: '#ef4444', // Dark mode destructive
          light: '#dc2626', // Light mode destructive
        },
      },
      // Keyframe animations for smooth transitions
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'hover-fade': {
          from: {
            backgroundColor: 'transparent',
            opacity: 0.8,
          },
          to: {
            backgroundColor: 'hsl(var(--card))',
            opacity: 1,
          },
        },
      },
      // Animation configurations
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'hover-fade': 'hover-fade 0.2s ease-in-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'), // For smooth animations
    require('@tailwindcss/forms'), // For better form styling
    require('@tailwindcss/typography'), // For text content styling
  ],
};