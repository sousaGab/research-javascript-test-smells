it('should match regular expressions in a string', () => {
  const testCases = [
    // true cases
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
    
    // false cases
    ['', 'a', false],
    ['a', '', false],
    ['aab', 'aa', false],
    ['aab', 'baa', false],
    ['aabc', '...', false],
    ['aaabbdd', 'a*b*c*', false],
    ['mississippi', 'mis*is*p*.', false],
    ['ab', 'a*', false],
    ['abba', 'a*b*.c', false],
    ['abba', '.*c', false]
  ];

  testCases.forEach(([input1, input2, expected]) => {
    expect(regularExpressionMatching(input1, input2)).toBe(expected);
  });
});