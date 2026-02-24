it('should create hash table of certain size', () => {
  const testCases = [
    { size: undefined, expected: 32 },
    { size: 64, expected: 64 },
  ];

  testCases.forEach(({ size, expected }) => {
    const hashTable = new HashTable(size);
    expect(hashTable.buckets.length).toBe(expected);
  });
});