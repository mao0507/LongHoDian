/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Atlassian Design System Colors
        'ds-background': {
          neutral: 'var(--ds-background-neutral)',
          'neutral-subtle': 'var(--ds-background-neutral-subtle)',
          'neutral-bold': 'var(--ds-background-neutral-bold)',
          selected: 'var(--ds-background-selected)',
          'selected-bold': 'var(--ds-background-selected-bold)',
          brand: 'var(--ds-background-brand-bold)',
          danger: 'var(--ds-background-danger)',
          warning: 'var(--ds-background-warning)',
          success: 'var(--ds-background-success)',
          discovery: 'var(--ds-background-discovery)',
          information: 'var(--ds-background-information)',
        },
        'ds-text': {
          DEFAULT: 'var(--ds-text)',
          subtlest: 'var(--ds-text-subtlest)',
          subtle: 'var(--ds-text-subtle)',
          link: 'var(--ds-text-link)',
          inverse: 'var(--ds-text-inverse)',
          disabled: 'var(--ds-text-disabled)',
          accent: {
            red: 'var(--ds-text-accent-red)',
            orange: 'var(--ds-text-accent-orange)',
            yellow: 'var(--ds-text-accent-yellow)',
            green: 'var(--ds-text-accent-green)',
            teal: 'var(--ds-text-accent-teal)',
            blue: 'var(--ds-text-accent-blue)',
            purple: 'var(--ds-text-accent-purple)',
            magenta: 'var(--ds-text-accent-magenta)',
          },
        },
        'ds-border': {
          DEFAULT: 'var(--ds-border)',
          bold: 'var(--ds-border-bold)',
          focus: 'var(--ds-border-focus)',
          error: 'var(--ds-border-error)',
          selected: 'var(--ds-border-selected)',
          disabled: 'var(--ds-border-disabled)',
          brand: 'var(--ds-border-brand)',
        },
        'ds-surface': {
          DEFAULT: 'var(--ds-surface)',
          raised: 'var(--ds-surface-raised)',
          overlay: 'var(--ds-surface-overlay)',
          sunken: 'var(--ds-surface-sunken)',
        },
      },
      spacing: {
        // Atlassian Design System Spacing
        'ds-025': 'var(--ds-space-025)',
        'ds-050': 'var(--ds-space-050)',
        'ds-075': 'var(--ds-space-075)',
        'ds-100': 'var(--ds-space-100)',
        'ds-150': 'var(--ds-space-150)',
        'ds-200': 'var(--ds-space-200)',
        'ds-250': 'var(--ds-space-250)',
        'ds-300': 'var(--ds-space-300)',
        'ds-400': 'var(--ds-space-400)',
        'ds-500': 'var(--ds-space-500)',
        'ds-600': 'var(--ds-space-600)',
        'ds-800': 'var(--ds-space-800)',
        'ds-1000': 'var(--ds-space-1000)',
      },
      borderRadius: {
        // Atlassian Design System Border Radius
        'ds-050': 'var(--ds-border-radius-050)',
        'ds-100': 'var(--ds-border-radius-100)',
        'ds-200': 'var(--ds-border-radius-200)',
        'ds-300': 'var(--ds-border-radius-300)',
        'ds-400': 'var(--ds-border-radius-400)',
        'ds-round': 'var(--ds-border-radius-round)',
      },
      fontFamily: {
        // Atlassian Design System Font Family
        sans: ['var(--ds-font-family-sans)', 'sans-serif'],
        mono: ['var(--ds-font-family-monospace)', 'monospace'],
      },
      boxShadow: {
        // Atlassian Design System Elevation
        'ds-surface': 'var(--ds-elevation-shadow-surface)',
        'ds-overlay': 'var(--ds-elevation-shadow-overlay)',
        'ds-raised': 'var(--ds-elevation-shadow-raised)',
      },
    },
  },
  plugins: [],
}
