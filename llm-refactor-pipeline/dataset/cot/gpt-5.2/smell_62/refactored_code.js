it('should create hash table of certain size', () => {
  const testCases = [
    { size: undefined, expectedBucketsLength: 32 },
    { size: 64, expectedBucketsLength: 64 },
  ];

  testCases.forEach(({ size, expectedBucketsLength }) => {
    const hashTable = size === undefined ? new HashTable() : new HashTable(size);
    expect(hashTable.buckets).toHaveLength(expectedBucketsLength);
  });
});