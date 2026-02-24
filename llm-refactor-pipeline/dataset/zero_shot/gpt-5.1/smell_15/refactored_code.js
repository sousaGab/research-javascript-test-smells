it('should search for an element in sorted array', () => {
  const testCases = [
    { array: [], target: 1, expected: -1 },
    { array: [1], target: 2, expected: -1 },
    { array: [1], target: 1, expected: 0 },
    { array: [1, 2], target: 1, expected: 0 },
    { array: [1, 1, 1], target: 1, expected: 0 },
    { array: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 2, expected: 1 },
    { array: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 0, expected: -1 },
    { array: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 7, expected: -1 },
    { array: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 5, expected: 2 },
    { array: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 20, expected: 4 },
    { array: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 30, expected: 7 },
    { array: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 48, expected: 8 },
  ];

  testCases.forEach(({ array, target, expected }) => {
    expect(jumpSearch(array, target)).toBe(expected);
  });
});