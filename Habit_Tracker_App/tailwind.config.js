/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper:     '#F3F1EA',
        paperLine: '#DAD3C0',
        ink:       '#1F2B24',
        inkSoft:   '#566057',
        ember:     '#E2672F',
        emberSoft: '#F4D9C8',
        pine:      '#2F6F62',
        pineSoft:  '#DCEAE5',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"',         'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],  
}
