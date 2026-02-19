import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#38E078',
          dark: '#2DB863',
          light: '#5FE896',
        },
        background: {
          DEFAULT: '#0f1914',
          secondary: '#16261e',
          tertiary: '#1e3328',
          elevated: '#243d2e',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'app-content': 'min(1200px, 100%)',
      },
      spacing: {
        'sidebar': '16rem',
        'sidebar-collapsed': '5rem',
      },
    },
  },
  plugins: [],
}
export default config
