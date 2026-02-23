it('should create hash table of certain size', () => {
    const defaultHashTable = new HashTable();
    expect(defaultHashTable.buckets).toHaveLength(32);

    const biggerHashTable = new HashTable(64);
    expect(biggerHashTable.buckets).toHaveLength(64);
  })