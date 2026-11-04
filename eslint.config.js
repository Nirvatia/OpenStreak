// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'design/*'],
  },
  {
    // ВРЕМЕННО: эти правила React Compiler ругаются на старые компоненты
    // (формы шторок, Animated-рефы в Toast/TaskRow, Math.random в Burst).
    // Все они переписываются на этапе редизайна — после этого вернуть в 'error'.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
]);
