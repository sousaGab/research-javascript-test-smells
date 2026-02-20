it('should create hash table of certain size', () => {
    const defaultHashTable = new HashTable();
    expect(defaultHashTable.buckets.length).toBe(32);

    const biggerHashTable = new HashTable(64);
    expect(biggerHashTable.buckets.length).toBe(64);

    const evenBiggerHashTable = new HashTable(128);
    expect(evenBiggerHashTable.buckets.length).toBe(128);
  })