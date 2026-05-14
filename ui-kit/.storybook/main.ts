import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-themes',
    '@storybook/addon-designs',
    'storybook-addon-pseudo-states',
    '@geometricpanda/storybook-addon-badges',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // Only run docgen on actual component sources — keeps preview.tsx /
      // storybook config files out of the warning stream.
      include: ['src/**/*.{ts,tsx}'],
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  viteFinal: async (vite) => {
    vite.plugins = vite.plugins ?? []
    vite.plugins.push(tailwindcss())
    vite.resolve = vite.resolve ?? {}
    vite.resolve.alias = {
      ...(vite.resolve.alias as Record<string, string> | undefined),
      '@': fileURLToPath(new URL('../src', import.meta.url)),
    }
    return vite
  },
}

export default config
