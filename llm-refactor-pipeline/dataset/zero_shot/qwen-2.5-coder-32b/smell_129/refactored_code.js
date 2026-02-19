it('should match regular expressions in a string', () => {
  const trueCases = [
    ['', ''],
    ['a', 'a'],
    ['aa', 'aa'],
    ['aab', 'aab'],
    ['aab', 'aa.'],
    ['aab', '.a.'],
    ['aab', '...'],
    ['a', 'a*'],
    ['aaa', 'a*'],
    ['aaab', 'a*b'],
    ['aaabb', 'a*b*'],
    ['aaabb', 'a*b*c*'],
    ['', 'a*'],
    ['xaabyc', 'xa*b.c'],
    ['aab', 'c*a*b*'],
    ['mississippi', 'mis*is*.p*.'],
    ['ab', '.*']
  ];

  const falseCases = [
    ['', 'a'],
    ['a', ''],
    ['aab', 'aa'],
    ['aab', 'baa'],
    ['aabc', '...'],
    ['aaabbdd', 'a*b*c*'],
    ['mississippi', 'mis*is*p*.'],
    ['ab', 'a*'],
    ['abba', 'a*b*.c'],
    ['abba', '.*c']
  ];

  trueCases.forEach(([s, p]) => {
    expect(regularExpressionMatching(s, p)).toBe(true);
  });

  falseCases.forEach(([s, p]) => {
    expect(regularExpressionMatching(s, p)).toBe(false);
  });
});