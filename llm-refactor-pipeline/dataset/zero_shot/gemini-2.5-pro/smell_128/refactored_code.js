describe('should set, read and delete data with collisions', () => {
  let hashTable;

  beforeEach(() => {
    hashTable = new HashTable(3);
    // Note: hash('a') === 1 and hash('d') === 1, causing a collision.
    hashTable.set('a', 'sky-old');
    hashTable.set('a', 'sky'); // Update 'a'
    hashTable.set('b', 'sea');
    hashTable.set('c', 'earth');
    hashTable.set('d', 'ocean'); // Collides with 'a'
  });

  it('should generate correct hashes for keys', () => {
    expect(hashTable.hash('a')).toBe(1);
    expect(hashTable.hash('b')).toBe(2);
    expect(hashTable.hash('c')).toBe(0);
    expect(hashTable.hash('d')).toBe(1);
  });

  it('should set values and form correct bucket chains on collision', () => {
    const stringifier = (value) => `${value.key}:${value.value}`;
    expect(hashTable.buckets[0].toString(stringifier)).toBe('c:earth');
    expect(hashTable.buckets[1].toString(stringifier)).toBe('a:sky,d:ocean');
    expect(hashTable.buckets[2].toString(stringifier)).toBe('b:sea');
  });

  it('should check for the existence of keys', () => {
    expect(hashTable.has('b')).toBe(true);
    expect(hashTable.has('c')).toBe(true);
    expect(hashTable.has('x')).toBe(false);
  });

  it('should get values for existing keys and handle non-existent keys', () => {
    expect(hashTable.get('a')).toBe('sky');
    expect(hashTable.get('d')).toBe('ocean');
    expect(hashTable.get('x')).not.toBeDefined();
  });

  it('should delete a key from a collision chain and preserve the chain', () => {
    hashTable.delete('a');
    expect(hashTable.get('a')).not.toBeDefined();
    expect(hashTable.get('d')).toBe('ocean');
  });

  it('should handle deletion of a non-existent key', () => {
    expect(hashTable.delete('not-existing')).toBeNull();
  });

  it('should allow updating a key after a deletion in the same bucket', () => {
    hashTable.delete('a'); // Pre-condition
    hashTable.set('d', 'ocean-new');
    expect(hashTable.get('d')).toBe('ocean-new');
  });
});