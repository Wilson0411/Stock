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
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        tide: 'rgb(var(--tide-rgb) / <alpha-value>)',
        signal: 'rgb(var(--signal-rgb) / <alpha-value>)',
        foam: 'rgb(var(--foam-rgb) / <alpha-value>)',
        mint: 'rgb(var(--mint-rgb) / <alpha-value>)',
        rose: 'rgb(var(--rose-rgb) / <alpha-value>)'
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