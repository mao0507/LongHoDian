import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import prettierConfig from '@vue/eslint-config-prettier'

export default [
  ...pluginVue.configs['flat/strongly-recommended'],
  ...defineConfigWithVueTs(
    {
      name: 'app/files-to-lint',
      files: ['**/*.{ts,mts,tsx,vue,js,jsx,cjs,mjs,cts}'],
    },

    {
      name: 'app/files-to-ignore',
      ignores: [
        '**/dist/**',
        '**/dist-ssr/**',
        '**/coverage/**',
        '**/dev-dist/**',
        'components.d.ts',
        'stats.html',
        'node_modules/**',
      ],
    },

    vueTsConfigs.recommended,

    {
      rules: {
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single', { avoidEscape: true }],
        semi: ['error', 'always'],
        'vue/multi-word-component-names': 'off',
        // 強制使用 Composition API
        'vue/no-options-api': 'error',
        // TypeScript 相關規則（透過 vueTsConfigs.recommended 已包含）
        // Props/Emits 型別檢查主要透過 TypeScript 編譯器進行
      },
    },

    {
      files: ['**/*.cjs'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
      },
    }
  ),
  prettierConfig,
]
