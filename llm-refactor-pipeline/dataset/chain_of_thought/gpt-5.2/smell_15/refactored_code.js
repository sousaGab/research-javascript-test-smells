it('should search for an element in sorted array', () => {
  const cases = [
    { arr: [], target: 1, expected: -1 },
    { arr: [1], target: 2, expected: -1 },
    { arr: [1], target: 1, expected: 0 },
    { arr: [1, 2], target: 1, expected: 0 },
    { arr: [1, 1, 1], target: 1, expected: 0 },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 2, expected: 1 },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 0, expected: -1 },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 7, expected: -1 },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 5, expected: 2 },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 20, expected: 4 },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 30, expected: 7 },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 48, expected: 8 },
  ];

  cases.forEach(({ arr, target, expected }) => {
    expect(jumpSearch(arr, target)).toBe(expected);
  });
});