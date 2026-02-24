describe('HashTable', () => {
  it('should create a hash table with default size', () => {
    const hashTable = new HashTable();
    expect(hashTable.buckets.length).toBe(32);
  });

  it('should create a hash table with a specified size', () => {
    const hashTable = new HashTable(64);
    expect(hashTable.buckets.length).toBe(64);
  });
});