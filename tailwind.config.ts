import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sitrap: {
          green: '#4CAF50',
          dark: '#2E7D32',
          graphite: '#1E1E1E',
          pale: '#EEF7EE'
        }
      }
    },
  },
  plugins: [],
};
export default config;
