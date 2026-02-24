describe('HashTable', () => {
  it('should create a hash table with default size', () => {
    const defaultHashTable = new HashTable();
    expect(defaultHashTable.buckets.length).toBe(32);
  });

  it('should create a hash table with specified size', () => {
    const biggerHashTable = new HashTable(64);
    expect(biggerHashTable.buckets.length).toBe(64);
  });
});