describe('HashTable with collisions', () => {
  let hashTable;

  beforeEach(() => {
    hashTable = new HashTable(3);
    hashTable.set('a', 'sky-old');
    hashTable.set('a', 'sky'); // Overwrite
    hashTable.set('b', 'sea');
    hashTable.set('c', 'earth');
    hashTable.set('d', 'ocean'); // Collides with 'a'
  });

  it('should store values and handle collisions correctly', () => {
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

  it('should get values for existing keys and return undefined for non-existent ones', () => {
    expect(hashTable.get('a')).toBe('sky');
    expect(hashTable.get('d')).toBe('ocean');
    expect(hashTable.get('x')).not.toBeDefined();
  });

  it('should overwrite the value for an existing key', () => {
    // The value 'sky-old' is overwritten by 'sky' in beforeEach
    expect(hashTable.get('a')).toBe('sky');
  });

  it('should delete keys and handle linked list correctly', () => {
    expect(hashTable.delete('not-existing')).toBeNull();

    hashTable.delete('a');

    expect(hashTable.get('a')).not.toBeDefined();
    expect(hashTable.get('d')).toBe('ocean'); // The colliding key should remain
  });

  it('should allow updating a value after a collision-related deletion', () => {
    hashTable.delete('a');
    hashTable.set('d', 'ocean-new');

    expect(hashTable.get('d')).toBe('ocean-new');
  });
});