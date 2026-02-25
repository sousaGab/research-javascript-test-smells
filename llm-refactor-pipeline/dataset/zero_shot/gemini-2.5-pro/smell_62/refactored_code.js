describe('HashTable', () => {
  it('should create a hash table with the default size', () => {
    const defaultHashTable = new HashTable();
    expect(defaultHashTable.buckets.length).toBe(32);
  });

  it('should create a hash table with a specified size', () => {
    const biggerHashTable = new HashTable(64);
    expect(biggerHashTable.buckets.length).toBe(64);
  });
});