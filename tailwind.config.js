/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0d0f14',
          surface: '#13161d',
          raised: '#1a1e28',
          hover: '#222736',
        },
        primary: '#f0f2f7',
        secondary: '#9aa0b4',
        placeholder: '#5c6278',
        accent: {
          blue: '#6c8fff',
          green: '#3ecf8e',
          red: '#f87171',
          yellow: '#fbbf24',
          purple: '#a78bfa',
        },
        surface: '#13161d',
        raised: '#1a1e28',
        hover: '#222736',
        error: '#f87171',
        warning: '#fbbf24',
        success: '#3ecf8e',
        ink: '#f0f2f7',
        'ink-muted': '#9aa0b4',
        'ink-dim': '#5c6278',
      },
      fontFamily: {
        sans: ['DM Sans', 'Segoe UI', 'sans-serif'],
        display: ['DM Sans', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'stats': '28px',
        'heading': '16px',
        'panel': '14px',
        'body': '13.5px',
        'label': '12px',
        'micro': '10px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
        'pill': '99px',
      },
      spacing: {
        'card': '14px',
        'card-lg': '16px',
        'panel': '18px',
        'panel-lg': '20px',
        'section': '24px',
      },
      transitionDuration: {
        'base': '150ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
