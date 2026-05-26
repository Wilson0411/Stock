import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b1720',
        tide: '#12354a',
        signal: '#e07a2d',
        foam: '#ecf5f7',
        mint: '#73c8a9',
        rose: '#e66b6b'
      },
      boxShadow: {
        panel: '0 18px 60px rgba(7, 20, 26, 0.18)'
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(11, 23, 32, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11, 23, 32, 0.05) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};

export default config;