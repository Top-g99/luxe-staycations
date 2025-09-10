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
        // Brand Colors from Design System
        primary: {
          DEFAULT: '#322a2b',
          dark: '#1A1A1A',
          light: '#4A3735'
        },
        secondary: {
          DEFAULT: '#151515',
          dark: '#704F49'
        },
        background: {
          DEFAULT: '#f7ede1',
          light: '#E8E2D9'
        },
        accent: {
          DEFAULT: '#B8A195',
          dark: '#4A4A4A'
        }
      },
      fontFamily: {
        'gilda': ['Gilda Display', 'serif'],
        'nunito': ['Nunito', 'sans-serif']
      },
      fontSize: {
        'h1': ['96px', { lineHeight: '120%', fontWeight: '400' }],
        'h2': ['60px', { lineHeight: '120%', fontWeight: '400' }],
        'h3': ['36px', { lineHeight: '130%', fontWeight: '400' }],
        'h4': ['28px', { lineHeight: '130%', fontWeight: '400' }],
        'button': ['20px', { lineHeight: '150%', fontWeight: '500' }]
      }
    },
  },
  plugins: [],
}
export default config
