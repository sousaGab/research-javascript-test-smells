describe('HashTable', () => {
  let hashTable;

  beforeEach(() => {
    hashTable = new HashTable(3);
  });

  it('should generate correct hashes for keys, including collisions', () => {
    expect(hashTable.hash('a')).toBe(1);
    expect(hashTable.hash('b')).toBe(2);
    expect(hashTable.hash('c')).toBe(0);
    expect(hashTable.hash('d')).toBe(1); // Collision with 'a'
  });

  it('should set, get, and overwrite values', () => {
    hashTable.set('a', 'sky-old');
    hashTable.set('a', 'sky');

    expect(hashTable.get('a')).toBe('sky');
    expect(hashTable.get('x')).not.toBeDefined();
  });

  it('should correctly check for the existence of keys', () => {
    hashTable.set('b', 'sea');

    expect(hashTable.has('b')).toBe(true);
    expect(hashTable.has('x')).toBe(false);
  });

  it('should handle collisions when setting and getting data', () => {
    // Keys 'a' and 'd' collide in a table of size 3.
    hashTable.set('a', 'sky');
    hashTable.set('d', 'ocean');

    expect(hashTable.get('a')).toBe('sky');
    expect(hashTable.get('d')).toBe('ocean');
  });

  it('should delete data by key', () => {
    hashTable.set('a', 'sky');
    hashTable.set('d', 'ocean'); // Collision with 'a'

    hashTable.delete('a');

    expect(hashTable.get('a')).not.toBeDefined();
    expect(hashTable.has('a')).toBe(false);
    expect(hashTable.get('d')).toBe('ocean'); // Ensure other item in bucket remains
  });

  it('should return null when deleting a non-existent key', () => {
    expect(hashTable.delete('not-existing')).toBeNull();
  });

  it('should allow updating a value after a collision and deletion', () => {
    hashTable.set('a', 'sky');
    hashTable.set('d', 'ocean');
    hashTable.delete('a');

    hashTable.set('d', 'ocean-new');
    expect(hashTable.get('d')).toBe('ocean-new');
  });

  it('should correctly represent buckets as strings after multiple operations', () => {
    hashTable.set('a', 'sky');
    hashTable.set('b', 'sea');
    hashTable.set('c', 'earth');
    hashTable.set('d', 'ocean'); // Collides with 'a'

    const stringifier = (value) => `${value.key}:${value.value}`;

    expect(hashTable.buckets[0].toString(stringifier)).toBe('c:earth');
    expect(hashTable.buckets[1].toString(stringifier)).toBe('a:sky,d:ocean');
    expect(hashTable.buckets[2].toString(stringifier)).toBe('b:sea');
  });
});