/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        'sidebar-bg': 'var(--color-sidebar-bg)',
        highlight: 'var(--color-highlight)',
        surface: '#F4F6FA',
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(0,0,0,0.07)',
        card: '0 2px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
