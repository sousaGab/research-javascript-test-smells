module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: [
    "js",
    "jsx",
    "tsx",
    "ts"
  ],
  rootDir: './test/',
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest"
  }
};
