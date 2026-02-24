it.each([
  { size: undefined, expectedLength: 32 },
  { size: 64, expectedLength: 64 },
])('should create hash table of size $expectedLength', ({ size, expectedLength }) => {
  const hashTable = new HashTable(size);
  expect(hashTable.buckets).toHaveLength(expectedLength);
});