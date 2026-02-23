describe('jumpSearch', () => {
  const testCases = [
    { arr: [], target: 1, expected: -1, description: 'in an empty array' },
    { arr: [1], target: 2, expected: -1, description: 'when element is not present' },
    { arr: [1], target: 1, expected: 0, description: 'in a single-element array' },
    { arr: [1, 2], target: 1, expected: 0, description: 'as the first element' },
    { arr: [1, 1, 1], target: 1, expected: 0, description: 'in an array with duplicates' },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 2, expected: 1, description: 'as an early element' },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 0, expected: -1, description: 'when element is smaller than all array elements' },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 7, expected: -1, description: 'when element is not present in a populated array' },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 5, expected: 2, description: 'in the middle of the array' },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 20, expected: 4, description: 'in the middle of the array' },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 30, expected: 7, description: 'towards the end of the array' },
    { arr: [1, 2, 5, 10, 20, 21, 24, 30, 48], target: 48, expected: 8, description: 'as the last element' },
  ];

  test.each(testCases)(
    'should return $expected when searching for $target $description',
    ({ arr, target, expected }) => {
      expect(jumpSearch(arr, target)).toBe(expected);
    }
  );
});