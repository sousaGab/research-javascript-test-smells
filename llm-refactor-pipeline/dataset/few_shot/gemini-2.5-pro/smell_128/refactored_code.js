describe('HashTable', () => {
  let hashTable;

  beforeEach(() => {
    hashTable = new HashTable(3);
  });

  it('should set and get values', () => {
    hashTable.set('a', 'sky');
    hashTable.set('b', 'sea');

    expect(hashTable.get('a')).toBe('sky');
    expect(hashTable.get('b')).toBe('sea');
  });

  it('should overwrite the value for an existing key', () => {
    hashTable.set('a', 'sky-old');
    hashTable.set('a', 'sky');

    expect(hashTable.get('a')).toBe('sky');
  });

  it('should return undefined for non-existent keys', () => {
    expect(hashTable.get('x')).not.toBeDefined();
    expect(hashTable.has('x')).toBe(false);
  });

  it('should correctly check for the existence of a key', () => {
    hashTable.set('c', 'earth');
    expect(hashTable.has('c')).toBe(true);
  });

  it('should handle hash collisions during set and get', () => {
    // 'a' and 'd' both hash to index 1.
    expect(hashTable.hash('a')).toBe(1);
    expect(hashTable.hash('d')).toBe(1);

    hashTable.set('a', 'sky');
    hashTable.set('d', 'ocean');

    expect(hashTable.get('a')).toBe('sky');
    expect(hashTable.get('d')).toBe('ocean');

    // Verify internal structure for collision.
    const stringifier = (value) => `${value.key}:${value.value}`;
    expect(hashTable.buckets[1].toString(stringifier)).toBe('a:sky,d:ocean');
  });

  it('should delete keys and handle collisions during deletion', () => {
    hashTable.set('a', 'sky');
    hashTable.set('d', 'ocean'); // 'a' and 'd' collide.

    hashTable.delete('a');

    expect(hashTable.has('a')).toBe(false);
    expect(hashTable.get('a')).not.toBeDefined();
    expect(hashTable.get('d')).toBe('ocean'); // Other key in bucket remains.
  });

  it('should return null when trying to delete a non-existent key', () => {
    expect(hashTable.delete('not-existing')).toBeNull();
  });

  it('should allow updating a key after a collision-related deletion', () => {
    hashTable.set('a', 'sky');
    hashTable.set('d', 'ocean'); // 'a' and 'd' collide.

    hashTable.delete('a');
    hashTable.set('d', 'ocean-new');

    expect(hashTable.get('d')).toBe('ocean-new');
  });
});