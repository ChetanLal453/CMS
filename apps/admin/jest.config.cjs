const nextJest = require('next/jest')
const path = require('path')

const createJestConfig = nextJest({
  dir: path.resolve(__dirname),
})

const customJestConfig = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: {
    '^@/(.*)$': path.resolve(__dirname, 'src/$1'),
    '^@uadmin/shared/(.*)$': path.resolve(__dirname, '../../packages/shared/$1'),
  },
}

module.exports = createJestConfig(customJestConfig)
