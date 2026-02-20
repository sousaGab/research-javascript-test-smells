it('should create hash table with correct bucket size', () => {
  const defaultHashTable = new HashTable();
  expect(defaultHashTable.buckets).toHaveLength(32);

  const biggerHashTable = new HashTable(64);
  expect(biggerHashTable.buckets).toHaveLength(64);
});