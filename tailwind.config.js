/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        surface: {
          0: '#0a0a0f',
          1: '#111118',
          2: '#1a1a26',
          3: '#22223a',
          // 4: '#2c2c4a',
          4: '#6a6a8f'
        },
        accent: {
          cyan: '#00e5ff',
          violet: '#7c3aed',
          green: '#00ff94',
          red: '#ff3366',
          amber: '#ffb300',
        },
        border: {
          dim: '#2a2a3e',
          bright: '#3a3a5c',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0,229,255,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0,229,255,0.6), 0 0 40px rgba(0,229,255,0.2)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'node': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'node-active': '0 0 0 2px rgba(0,229,255,0.4), 0 4px 24px rgba(0,229,255,0.15)',
        'node-error': '0 0 0 2px rgba(255,51,102,0.5), 0 4px 24px rgba(255,51,102,0.2)',
      },
    },
  },
  plugins: [],
}
