describe('HashTable with collisions', () => {
  let hashTable;

  beforeEach(() => {
    hashTable = new HashTable(3);
    hashTable.set('a', 'sky'); // hashes to 1
    hashTable.set('b', 'sea'); // hashes to 2
    hashTable.set('c', 'earth'); // hashes to 0
    hashTable.set('d', 'ocean'); // hashes to 1 (collision with 'a')
  });

  it('should generate correct hashes for keys', () => {
    // This test is for the hash function itself, independent of state
    const newTable = new HashTable(3);
    expect(newTable.hash('a')).toBe(1);
    expect(newTable.hash('b')).toBe(2);
    expect(newTable.hash('c')).toBe(0);
    expect(newTable.hash('d')).toBe(1);
  });

  it('should get values for keys, including those with collisions', () => {
    expect(hashTable.get('a')).toBe('sky');
    expect(hashTable.get('d')).toBe('ocean');
  });

  it('should return undefined for non-existent keys', () => {
    expect(hashTable.get('x')).not.toBeDefined();
  });

  it('should correctly check for the existence of keys', () => {
    expect(hashTable.has('b')).toBe(true);
    expect(hashTable.has('c')).toBe(true);
    expect(hashTable.has('x')).toBe(false);
  });

  it('should handle overwriting existing keys', () => {
    hashTable.set('a', 'sky-new');
    expect(hashTable.get('a')).toBe('sky-new');

    hashTable.set('d', 'ocean-new');
    expect(hashTable.get('d')).toBe('ocean-new');
  });

  it('should delete a key and not affect other keys in the same bucket', () => {
    hashTable.delete('a');

    expect(hashTable.get('a')).not.toBeDefined();
    expect(hashTable.get('d')).toBe('ocean');
  });

  it('should return null when trying to delete a non-existent key', () => {
    expect(hashTable.delete('not-existing')).toBeNull();
  });

  it('should store colliding items in the same bucket', () => {
    const stringifier = (value) => `${value.key}:${value.value}`;

    expect(hashTable.buckets[0].toString(stringifier)).toBe('c:earth');
    expect(hashTable.buckets[1].toString(stringifier)).toBe('a:sky,d:ocean');
    expect(hashTable.buckets[2].toString(stringifier)).toBe('b:sea');
  });
});