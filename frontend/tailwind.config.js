export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['"Instrument Serif"', 'Inter', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bone: '#F4EEE3',
        boneSoft: '#FAF6EE',
        ink: '#1B1A1F',
        ink2: '#39363F',
        muted: '#6F6A66',
        forest: '#0F4F4A',
        forestDeep: '#0A3A36',
        terracotta: '#C25E3B',
        gold: '#C9A961',
        line: '#E4D9C5',
        card: '#FFFDF8',
        success: '#1F7A57',
        warning: '#B8862C',
        danger: '#B23A48',
      },
    }
  },
  plugins: []
}
