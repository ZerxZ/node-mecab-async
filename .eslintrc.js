/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'standard'
  ],
  globals: {
    // __static: true,
    // __windowUrls: true,
    // __preloads: true,
    // __workers: true,
    NodeJS: true
  },
  parserOptions: {
    ecmaVersion: 12,
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    'space-before-function-paren': 0,
    'import/no-absolute-path': 0
  },
  ignorePatterns: [
    'node_modules/**',
    'dist/**'
  ]
}
