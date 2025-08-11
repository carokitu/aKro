import auto from 'eslint-config-canonical/auto';
import react from 'eslint-plugin-react';
import reactNative from 'eslint-plugin-react-native';

export default [
  ...auto,
  {
    plugins: {
      react,
      'react-native': reactNative,
    },
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        'react-native/react-native': true,
      },
    },
  },
  {
    ignores: [
      '**/node_modules/',
      '**/build/',
      '**/public/',
      '**/coverage/',
      '**/docs/',
      '**/.storybook/',
      '**/.git/',
      '**/.gitlab/',
      '**/.husky/',
      '**/.vscode/',
      '**/storybook/*.js',
      '**/selection.json',
      'eslint.config.mjs',
      'package-scripts.cjs',
      'package.json',
      'package-lock.json',
      'app-example',
      '**/.expo/**',
    ],
  },
  {
    files: ['**/*.tsx'],
    rules: {
      'jsx-a11y/click-events-have-key-events': 0,
      'jsx-a11y/interactive-supports-focus': 0,
      'jsx-a11y/no-noninteractive-element-interactions': 0,
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 0,
      'jsx-a11y/no-static-element-interactions': 0,
      'react-native/no-color-literals': 2,
      'react-native/no-inline-styles': 2,
      'react-native/no-raw-text': 0,
      'react-native/no-single-element-style-arrays': 2,
      'react-native/no-unused-styles': 2,
      'react-native/split-platform-components': 2,
      'react/forbid-component-props': 0,
      'react/jsx-no-constructed-context-values': 0,
      'react/jsx-pascal-case': [
        2,
        {
          allowAllCaps: true,
        },
      ],
      'react/prefer-read-only-props': 0,
    },
  },
  {
    files: ['**/**.{cjs,ts,tsx}'],
    rules: {
      '@stylistic/semi': ['error', 'never'],
      '@typescript-eslint/array-type': 0,
      '@typescript-eslint/no-use-before-define': 0,
      '@typescript-eslint/explicit-member-accessibility': 0,
      '@typescript-eslint/naming-convention': 0,
      '@typescript-eslint/triple-slash-reference': 0,
      'canonical/filename-match-exported': 0,
      'canonical/filename-match-regex': 0,
      'canonical/id-match': ['error', '^(_|[_$]?[_a-zA-Z0-9]*[a-zA-Z0-9])$'],
      'consistent-return': 0,
      'id-length': 0,
      'import/extensions': 0,
      'import/no-cycle': 0,
      'import/no-extraneous-dependencies': 0,
      'import/no-named-as-default': 0,
      'import/no-deprecated': 0,
      'jsdoc/no-undefined-types': [
        'error',
        {
          definedTypes: ['HTMLElement', 'DragEvent', 'Range'],
        },
      ],
      'n/callback-return': 0,
      'n/no-extraneous-import': 0,
      'no-barrel-import': 0,
      'no-bitwise': 0,
      'no-console': 0,
      'no-export-all': 0,
      'no-extraneous-dependencies': 0,
      'no-implicit-coercion': [
        2,
        {
          allow: ['!!', '+'],
        },
      ],
      'perfectionist/sort-imports': [
        'error',
        {
          customGroups: {
            type: {
              react: ['react', 'react-*'],
            },
            value: {
              lodash: ['lodash'],
              react: ['react', 'react-*'],
            },
          },
          groups: [
            'react',
            'type',
            ['builtin', 'external'],
            'lodash',
            'internal-type',
            'internal',
            ['parent-type', 'sibling-type', 'index-type'],
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
          ignoreCase: true,
          internalPattern: ['^@/.*'],
          maxLineLength: undefined,
          newlinesBetween: 'always',
          order: 'asc',
          type: 'alphabetical',
        },
      ],
      'perfectionist/sort-modules': 0,
      'perfectionist/sort-sets': 0,
      'prettier/prettier': [
        2,
        {
          arrowParens: 'always',
          bracketSameLine: false,
          bracketSpacing: true,
          endOfLine: 'lf',
          printWidth: 120,
          proseWrap: 'preserve',
          quoteProps: 'as-needed',
          semi: false,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'all',
          useTabs: false,
        },
        {
          usePrettierrc: false,
        },
      ],
      quotes: [
        'error',
        'single',
        {
          allowTemplateLiterals: true,
          avoidEscape: true,
        },
      ],
      'require-extension': 0,
      'require-unicode-regexp': 0,
      'unicorn/catch-error-name': [
        'error',
        {
          ignore: ['^err$', '^error$', '^cause$'],
          name: 'cause, error or err',
        },
      ],
      'unicorn/no-array-for-each': 0,
      'unicorn/no-array-reduce': 0,
      'unicorn/no-new-array': 0,
      'unicorn/no-object-as-default-parameter': 0,
      'unicorn/numeric-separators-style': [
        'error',
        {
          number: {
            groupLength: 3,
            minimumDigits: 5,
          },
        },
      ],
      'unicorn/prefer-math-trunc': 0,
      'unicorn/prefer-node-protocol': 0,
      'unicorn/prefer-query-selector': 0,
      'unicorn/prevent-abbreviations': 0,
      'virtual-module': 0,
    },
  },
  {
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
