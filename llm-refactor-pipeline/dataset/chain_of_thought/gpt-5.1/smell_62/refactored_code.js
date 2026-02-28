it('should create hash table of default size', () => {
  const defaultHashTable = new HashTable();
  expect(defaultHashTable.buckets).toHaveLength(32);
});

it('should create hash table of custom size', () => {
  const biggerHashTable = new HashTable(64);
  expect(biggerHashTable.buckets).toHaveLength(64);
});