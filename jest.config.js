/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*test.ts'
  ],
  collectCoverageFrom: [
    "src/*.ts",
    "src/**/*.ts",
    "!**/webWorkerFactory.ts",
    "!**/*internal.ts",
    "!**/*.worker.ts",
    "!**/node_modules/**",
    "!**/vendor/**",
    '!src/presentation/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
