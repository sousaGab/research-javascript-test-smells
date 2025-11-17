module.exports = {
  roots: ['test'],
  testRegex: 'test/(.*?/)?.*test.js$',
  testURL: 'http://localhost',
  coverageDirectory: './coverage/',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*'],
  coverageReporters: [
    'text-summary',
    'json'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ]
};
