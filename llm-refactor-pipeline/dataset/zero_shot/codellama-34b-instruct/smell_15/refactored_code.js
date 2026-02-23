it('should search for an element in sorted array', () => {
    const testCases = [
        { input: [], expected: -1 },
        { input: [1], expected: 0 },
        { input: [1, 2], expected: 0 },
        { input: [1, 1, 1], expected: 0 },
        { input: [1, 2, 5, 10, 20, 21, 24, 30, 48], expected: 1 },
        { input: [1, 2, 5, 10, 20, 21, 24, 30, 48], expected: -1 },
        { input: [1, 2, 5, 10, 20, 21, 24, 30, 48], expected: -1 },
        { input: [1, 2, 5, 10, 20, 21, 24, 30, 48], expected: -1 },
        { input: [1, 2, 5, 10, 20, 21, 24, 30, 48], expected: 2 },
        { input: [1, 2, 5, 10, 20, 21, 24, 30, 48], expected: 4 },
        { input: [1, 2, 5, 10, 20, 21, 24, 30, 48], expected: 7 },
        { input: [1, 2, 5, 10, 20, 21, 24, 30, 48], expected: 8 },
    ];

    testCases.forEach(({ input, expected }) => {
        expect(jumpSearch(input, 1)).toBe(expected);
    });
});