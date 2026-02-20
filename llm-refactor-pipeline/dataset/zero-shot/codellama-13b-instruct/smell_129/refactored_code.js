it('should match regular expressions in a string', () => {
    const testCases = [
        { input: '', expected: true },
        { input: 'a', expected: true },
        { input: 'aa', expected: true },
        { input: 'aab', expected: true },
        { input: 'aab', expected: true },
        { input: 'aab', expected: true },
        { input: 'aab', expected: true },
        { input: 'a', expected: true },
        { input: 'aaa', expected: true },
        { input: 'aaab', expected: true },
        { input: 'aaabb', expected: true },
        { input: 'aaabb', expected: true },
        { input: '', expected: true },
        { input: 'xaabyc', expected: true },
        { input: 'aab', expected: true },
        { input: 'mississippi', expected: true },
        { input: 'ab', expected: true },
        { input: '', expected: false },
        { input: 'a', expected: false },
        { input: 'aab', expected: false },
        { input: 'baa', expected: false },
        { input: 'aabc', expected: false },
        { input: 'aaabbdd', expected: false },
        { input: 'mississippi', expected: false },
        { input: 'ab', expected: false },
        { input: 'abba', expected: false },
        { input: 'abba', expected: false },
    ];

    testCases.forEach(({ input, expected }) => {
        expect(regularExpressionMatching(input)).toBe(expected);
    });
});