/** @type {import('tailwindcss').Config} */
export default {
  /* El tema oscuro lo marca data-theme="dark" en <html>, igual que la web v1
     (hero 3D, showroom y fondo de partículas escuchan ese atributo). */
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: {
    /* .container es la grilla de la v1 (1240 px, 24 px de margen): manda la suya */
    container: false,
  },
  theme: {
    /* Paleta de Control Red: azul institucional, gris de marca, tinta y el
       rojo de Hikvision como acento puntual (sin stock, alertas). */
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#15182B',
      cr: {
        blue: '#344AB2',
        'blue-press': '#25357F',
        'blue-deep': '#141B45',
        'blue-glow': '#8AA0FF',
        gray: '#6B6464',
        red: '#E2231A',
        'red-glow': '#FF6B63',
      },
    },
    extend: {
      screens: {
        xs: '400px',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        glass: '28px',
        'glass-lg': '38px',
        pill: '999px',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        400: '400ms',
      },
      keyframes: {
        'cr-pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(52,74,178,0.45)' },
          '70%': { boxShadow: '0 0 0 16px rgba(52,74,178,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(52,74,178,0)' },
        },
        'cr-rise': {
          '0%': { opacity: '0', transform: 'translateY(22px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'cr-breathe': {
          '0%,100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        'cr-marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'cr-pulse-ring': 'cr-pulse-ring 2.6s ease-out infinite',
        'cr-rise': 'cr-rise 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'cr-breathe': 'cr-breathe 2.4s ease-in-out infinite',
        'cr-marquee': 'cr-marquee 34s linear infinite',
      },
    },
  },
  plugins: [],
}
