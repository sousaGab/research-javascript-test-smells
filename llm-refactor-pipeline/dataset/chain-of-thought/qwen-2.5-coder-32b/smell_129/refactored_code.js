describe('regularExpressionMatching', () => {
  const testCases = [
    // True cases
    ['', '', true],
    ['a', 'a', true],
    ['aa', 'aa', true],
    ['aab', 'aab', true],
    ['aab', 'aa.', true],
    ['aab', '.a.', true],
    ['aab', '...', true],
    ['a', 'a*', true],
    ['aaa', 'a*', true],
    ['aaab', 'a*b', true],
    ['aaabb', 'a*b*', true],
    ['aaabb', 'a*b*c*', true],
    ['', 'a*', true],
    ['xaabyc', 'xa*b.c', true],
    ['aab', 'c*a*b*', true],
    ['mississippi', 'mis*is*.p*.', true],
    ['ab', '.*', true],

    // False cases
    ['a', 'a', false],
    ['', 'a', false],
    ['aab', 'aa', false],
    ['aab', 'baa', false],
    ['aabc', '...', false],
    ['aaabbdd', 'a*b*c*', false],
    ['mississippi', 'mis*is*p*.', false],
    ['ab', 'a*', false],
    ['abba', 'a*b*.c', false],
    ['abba', '.*c', false]
  ];

  testCases.forEach(([input1, input2, expected], index) => {
    it(`should handle case ${index + 1}: "${input1}" matches "${input2}"`, () => {
      expect(regularExpressionMatching(input1, input2)).toBe(expected);
    });
  });
});