const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx,md}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        ink: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        accent: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        reading: ['Georgia', 'Cambria', ...defaultTheme.fontFamily.serif],
      },
      typography: (theme) => ({
        ocean: {
          css: {
            '--tw-prose-body':        theme('colors.ink.800'),
            '--tw-prose-headings':    theme('colors.ocean.900'),
            '--tw-prose-links':       theme('colors.ocean.600'),
            '--tw-prose-bold':        theme('colors.ink.900'),
            '--tw-prose-counters':    theme('colors.ocean.500'),
            '--tw-prose-bullets':     theme('colors.ocean.400'),
            '--tw-prose-hr':          theme('colors.ink.200'),
            '--tw-prose-quotes':      theme('colors.ink.700'),
            '--tw-prose-quote-borders': theme('colors.ocean.400'),
            '--tw-prose-captions':    theme('colors.ink.500'),
            '--tw-prose-code':        theme('colors.ocean.800'),
            '--tw-prose-pre-code':    theme('colors.ink.100'),
            '--tw-prose-pre-bg':      theme('colors.ink.900'),
            '--tw-prose-th-borders':  theme('colors.ink.300'),
            '--tw-prose-td-borders':  theme('colors.ink.200'),
          },
        },
        invert: {
          css: {
            '--tw-prose-body':        theme('colors.ink.200'),
            '--tw-prose-headings':    theme('colors.ocean.300'),
            '--tw-prose-links':       theme('colors.ocean.400'),
          },
        },
      }),
      screens: {
        xs: '375px',
      },
      animation: {
        'fade-in': 'fadeIn .4s ease both',
        'slide-up': 'slideUp .35s cubic-bezier(.16,1,.3,1) both',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },              to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

