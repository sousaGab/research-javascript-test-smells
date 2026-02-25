describe('HashTable with collisions', () => {
  let hashTable;

  beforeEach(() => {
    hashTable = new HashTable(3);
    // Known hash values for size 3:
    // 'a' -> 1
    // 'b' -> 2
    // 'c' -> 0
    // 'd' -> 1 (collision with 'a')

    hashTable.set('a', 'sky-old');
    hashTable.set('a', 'sky'); // Update 'a'
    hashTable.set('b', 'sea');
    hashTable.set('c', 'earth');
    hashTable.set('d', 'ocean'); // Collision with 'a'
  });

  it('should set and get values, updating existing keys', () => {
    expect(hashTable.get('a')).toBe('sky');
    expect(hashTable.get('b')).toBe('sea');
    expect(hashTable.get('c')).toBe('earth');
  });

  it('should handle collisions by chaining values', () => {
    expect(hashTable.get('a')).toBe('sky');
    expect(hashTable.get('d')).toBe('ocean');
  });

  it('should correctly report if a key exists', () => {
    expect(hashTable.has('b')).toBe(true);
    expect(hashTable.has('d')).toBe(true);
    expect(hashTable.has('x')).toBe(false);
  });

  it('should return undefined for non-existent keys', () => {
    expect(hashTable.get('x')).not.toBeDefined();
  });

  it('should delete a key and make it inaccessible', () => {
    hashTable.delete('a');

    expect(hashTable.has('a')).toBe(false);
    expect(hashTable.get('a')).not.toBeDefined();
  });

  it('should not affect other keys in the same bucket when deleting', () => {
    hashTable.delete('a');

    expect(hashTable.has('d')).toBe(true);
    expect(hashTable.get('d')).toBe('ocean');
  });

  it('should return null when trying to delete a non-existent key', () => {
    expect(hashTable.delete('not-existing')).toBeNull();
  });

  it('should allow updating a key after a collision-related deletion', () => {
    hashTable.delete('a');
    hashTable.set('d', 'ocean-new');

    expect(hashTable.get('d')).toBe('ocean-new');
  });
});