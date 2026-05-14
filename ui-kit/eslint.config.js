import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import storybook from 'eslint-plugin-storybook'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['storybook-static', 'node_modules', '.claude/worktrees', 'ui-kit']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      {
        ...reactRefresh.configs.vite,
        rules: {
          ...reactRefresh.configs.vite.rules,
          'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
      },
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.stories.{ts,tsx}'],
    extends: [storybook.configs['flat/recommended']],
  },
])
