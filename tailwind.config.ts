import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
  corePlugins: {
    preflight: false
  },
  important: '#__next',
  plugins: [
    require('tailwindcss-logical'),
    require('./src/@core/tailwind/plugin'),
    function ({ addUtilities }: { addUtilities: (utilities: Record<string, any>, variants?: string[]) => void }) {
      const newUtilities = {
        '.scrollbar-custom::-webkit-scrollbar': {
          width: '4px',
          height: '8px'
        },
        '.scrollbar-custom::-webkit-scrollbar-track': {
          background: '#8C57FF30'
        },
        '.scrollbar-custom::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '20px',
          border: '0px solid #f1f1f1'
        },
        '.scrollbar-custom::-webkit-scrollbar-thumb:hover': {
          background: '#555'
        }
      }

      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
  theme: {
    extend: {
      scrollbar: {
        DEFAULT: {
          '::-webkit-scrollbar': {
            width: '4px',
            height: '8px'
          },

          '::-webkit-scrollbar-track': {
            background: '#f1f1f1'
          },
          '::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '20px',
            border: '0px solid #f1f1f1'
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: '#555'
          }
        }
      }
    }
  }
}

export default config
