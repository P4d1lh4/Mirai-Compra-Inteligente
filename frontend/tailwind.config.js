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
        /* ── Brand (Aurora - Green) ── */
        brand: {
          50: '#f0fdf9',
          100: '#b8f5e8', // aurora-tint
          200: '#99f2df',
          300: '#66ebd0',
          400: '#33e0bc',
          500: '#00c896', // aurora-mid (Primária)
          600: '#00a87a',
          700: '#007a60', // aurora-dark (Headers)
          800: '#005c48',
          900: '#001f18', // aurora-dim
        },
        /* ── Aurora (Mapeada para o mesmo verde para manter compatibilidade) ── */
        aurora: {
          50: '#f0fdf9',
          100: '#b8f5e8',
          200: '#99f2df',
          300: '#66ebd0',
          400: '#33e0bc',
          500: '#00c896',
          600: '#00a87a',
          700: '#007a60',
          800: '#005c48',
          900: '#001f18',
        },
        /* ── AI Blue ── */
        accent: {
          50: '#f0f7ff',
          100: '#b8d4f5', // ai-tint
          200: '#a0c4f1',
          300: '#78a6eb',
          400: '#4a7fd4', // ai-light
          500: '#2e52b8', // ai-mid
          600: '#26469c',
          700: '#1e3a8a', // ai-dark
          800: '#152e73',
          900: '#0f2257',
        },
        /* ── Surfaces (Mantendo fundo claro conforme solicitado) ── */
        surface: '#f3f4f6',
        border: '#e5e7eb',
        card: '#ffffff',
        /* ── Text & Utilities ── */
        text: '#030f0c',   // Utilizando a cor '--bg' escura da imagem como texto principal no tema claro
        muted: '#3d7060',  // mutted
        gold: '#f0c040',   // gold
        error: '#ff5c72',  // error
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
