module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    'components/**/*.tsx',
    'app/api/**/*.ts',
    '!**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
};
