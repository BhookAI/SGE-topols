import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Deep space monochromatic palette
        background: {
          DEFAULT: '#060608',
          secondary: '#0D0D0F',
          tertiary: '#131316',
          elevated: '#1A1A1E',
        },
        foreground: {
          DEFAULT: '#FFFFFF',
          secondary: '#8A8A8A',
          muted: '#4A4A4A',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.15)',
        },
        // Accent — pure white
        accent: {
          DEFAULT: '#FFFFFF',
          secondary: '#A0A0A0',
          tertiary: '#6A6A6A',
        },
        // Status — monochromatic
        success: '#CCCCCC',
        warning: '#AAAAAA',
        error: '#999999',
        info: '#BBBBBB',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #A0A0A0, #FFFFFF)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
