it('should handle data operations with collisions', () => {
    const hashTable = new HashTable(3);

    // Test hashing function
    expect(hashTable.hash('a')).toBe(1);
    expect(hashTable.hash('b')).toBe(2);
    expect(hashTable.hash('c')).toBe(0);
    expect(hashTable.hash('d')).toBe(1);

    // Test setting and retrieving values
    hashTable.set('a', 'sky-old');
    hashTable.set('a', 'sky');
    hashTable.set('b', 'sea');
    hashTable.set('c', 'earth');
    hashTable.set('d', 'ocean');

    // Test existence checks
    expect(hashTable.has('x')).toBe(false);
    expect(hashTable.has('b')).toBe(true);
    expect(hashTable.has('c')).toBe(true);

    // Test bucket contents
    const stringifier = (value) => `${value.key}:${value.value}`;
    expect(hashTable.buckets[0].toString(stringifier)).toBe('c:earth');
    expect(hashTable.buckets[1].toString(stringifier)).toBe('a:sky,d:ocean');
    expect(hashTable.buckets[2].toString(stringifier)).toBe('b:sea');

    // Test retrieval
    expect(hashTable.get('a')).toBe('sky');
    expect(hashTable.get('d')).toBe('ocean');
    expect(hashTable.get('x')).not.toBeDefined();

    // Test deletion
    expect(hashTable.delete('a')).toBeDefined();
    expect(hashTable.delete('not-existing')).toBeNull();
    expect(hashTable.get('a')).not.toBeDefined();
    expect(hashTable.get('d')).toBe('ocean');

    // Test reassignment
    hashTable.set('d', 'ocean-new');
    expect(hashTable.get('d')).toBe('ocean-new');
  })