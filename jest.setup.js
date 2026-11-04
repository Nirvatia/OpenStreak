/* global jest */
// Общая настройка Jest: нативных модулей в тестах нет — подменяем их моками.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
