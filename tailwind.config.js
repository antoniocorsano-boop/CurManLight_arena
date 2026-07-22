/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ui: {
          page: 'var(--ui-page)',
          surface: 'var(--ui-surface)',
          'surface-subtle': 'var(--ui-surface-subtle)',
          'surface-emphasis': 'var(--ui-surface-emphasis)',
          text: 'var(--ui-text)',
          'text-secondary': 'var(--ui-text-secondary)',
          'text-muted': 'var(--ui-text-muted)',
          border: 'var(--ui-border)',
          'border-strong': 'var(--ui-border-strong)',
          action: 'var(--ui-action)',
          'action-hover': 'var(--ui-action-hover)',
          'action-soft': 'var(--ui-action-soft)',
          success: 'var(--ui-success)',
          'success-soft': 'var(--ui-success-soft)',
          warning: 'var(--ui-warning)',
          'warning-soft': 'var(--ui-warning-soft)',
          danger: 'var(--ui-danger)',
          'danger-soft': 'var(--ui-danger-soft)',
          focus: 'var(--ui-focus)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'ui-control': 'var(--ui-radius-control)',
        'ui-panel': 'var(--ui-radius-panel)',
        'ui-dialog': 'var(--ui-radius-dialog)',
      },
      spacing: {
        'ui-1': 'var(--ui-space-1)',
        'ui-2': 'var(--ui-space-2)',
        'ui-3': 'var(--ui-space-3)',
        'ui-4': 'var(--ui-space-4)',
        'ui-5': 'var(--ui-space-5)',
        'ui-6': 'var(--ui-space-6)',
      },
      maxWidth: {
        'ui-content': 'var(--ui-content-max)',
      },
      height: {
        'ui-control-sm': 'var(--ui-control-height-sm)',
        'ui-control-md': 'var(--ui-control-height-md)',
      },
      boxShadow: {
        'ui-dialog': 'var(--ui-shadow-dialog)',
      },
    },
  },
  plugins: [],
}
