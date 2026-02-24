it.each([
  [undefined, 32],
  [64, 64]
])('should create hash table with correct bucket size when size is %p', (size, expectedSize) => {
  const hashTable = new HashTable(size);
  expect(hashTable.buckets.length).toBe(expectedSize);
});