it('should create hash table of certain size', () => {
    const defaultHashTable = new HashTable();
    expect(defaultHashTable.buckets.length).toBe(32, 'Default hash table should have 32 buckets');

    const biggerHashTable = new HashTable(64);
    expect(biggerHashTable.buckets.length).toBe(64, 'Bigger hash table should have 64 buckets');
  })