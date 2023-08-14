import type { Config } from 'jest';

const jestConfig: Config = {
    clearMocks: true,
    maxWorkers: 1,
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/src/**/*.test.ts'],
    moduleNameMapper: {
        '^@resolver/(.*)$': '<rootDir>/src/resolver/$1',
        '^@types/(.*)$': '<rootDir>/src/types/$1',
    },
};

export default jestConfig;
