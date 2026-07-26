/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          DEFAULT: '#ea580c',
          dark: '#9a3412',
          light: '#fed7aa',
        },
        surface: {
          DEFAULT: '#ffffff',
          soft: '#faf9f7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        card: '0 4px 20px rgba(0,0,0,0.06)',
        glow: '0 0 0 3px rgba(234,88,12,0.15)',
        'glow-lg': '0 8px 30px rgba(234,88,12,0.25)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'slide-up': { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pop': { '0%': { transform: 'scale(0.96)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        shimmer: { '0%': { backgroundPosition: '-500px 0' }, '100%': { backgroundPosition: '500px 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        'pulse-ring': { '0%': { boxShadow: '0 0 0 0 rgba(234,88,12,0.4)' }, '100%': { boxShadow: '0 0 0 10px rgba(234,88,12,0)' } },
        gradient: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.35s ease-out',
        pop: 'pop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        shimmer: 'shimmer 1.6s infinite linear',
        float: 'float 3s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
        gradient: 'gradient 6s ease infinite',
      },
      backgroundSize: {
        '200%': '200% 200%',
      },
    },
  },
  plugins: [],
};
