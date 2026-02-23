// Your COMPLETE refactored test code here

it('should create hash table of certain size', () => {
    const defaultHashTable = new HashTable();
    const biggerHashTable = new HashTable(64);

    expect(defaultHashTable.buckets.length).toBe(32);
    expect(biggerHashTable.buckets.length).toBe(64);
  })