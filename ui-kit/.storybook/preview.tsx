// Storybook's CSS entry. Imports `tailwindcss` first (so utilities exist)
// then the kit's theme. Mirrors the README's consumer setup contract.
import './storybook.css'

import { withThemeByDataAttribute } from '@storybook/addon-themes'
import type { Decorator, Preview } from '@storybook/react-vite'

/**
 * Why three separate concerns instead of one big `withThemeByDataAttribute`:
 * `addon-themes` registers a single toolbar entry called "Theme". If we call
 * `withThemeByDataAttribute` more than once, the toolbar UI for Theme will
 * collapse to whichever option set was registered last — even though every
 * decorator's effect still runs. So we use `withThemeByDataAttribute` for
 * the actual Theme (Light / Dark) and add separate Storybook globals +
 * custom decorators for Density and Module so they each get their own
 * toolbar dropdown.
 */
const withDataAttribute =
  (attribute: string, fallback: string): Decorator =>
  (Story, ctx) => {
    if (typeof document !== 'undefined') {
      const value = (ctx.globals as Record<string, string | undefined>)[attribute] ?? fallback
      document.documentElement.setAttribute(`data-${attribute}`, value)
    }
    return Story(ctx)
  }

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: { disable: true },
    badgesConfig: {
      'module:receptionist': {
        styles: { backgroundColor: '#268cff', color: '#ffffff' }, // --brand-500
        title: 'Receptionist',
      },
      'module:phlebo': {
        styles: { backgroundColor: '#10069f', color: '#ffffff' }, // --secondary-deep-500
        title: 'Phlebo',
      },
      'module:patient': {
        styles: { backgroundColor: '#60cdff', color: '#0b1424' }, // --secondary-light-500 + --ink-900
        title: 'Patient',
      },
      beta: {
        styles: { backgroundColor: '#d97706', color: '#ffffff' }, // --warn-500
        title: 'Beta',
      },
      deprecated: {
        styles: { backgroundColor: '#d83a3a', color: '#ffffff' }, // --danger-500
        title: 'Deprecated',
      },
    },
  },
  globalTypes: {
    density: {
      description: 'Density (sets data-density on <html>)',
      defaultValue: 'compact',
      toolbar: {
        title: 'Density',
        icon: 'expand',
        items: [
          { value: 'compact', title: 'Compact' },
          { value: 'cozy', title: 'Cozy' },
          { value: 'comfortable', title: 'Comfortable' },
        ],
        dynamicTitle: true,
      },
    },
    module: {
      description: 'Module (sets data-module on <html>)',
      defaultValue: 'receptionist',
      toolbar: {
        title: 'Module',
        icon: 'browser',
        items: [
          { value: 'receptionist', title: 'Receptionist' },
          { value: 'phlebo', title: 'Phlebo' },
          { value: 'patient', title: 'Patient' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { Light: 'light', Dark: 'dark' },
      defaultTheme: 'Light',
      attributeName: 'data-theme',
    }),
    withDataAttribute('density', 'compact'),
    withDataAttribute('module', 'receptionist'),
  ],
}

export default preview
