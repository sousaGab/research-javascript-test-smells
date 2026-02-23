it('should set, read and delete data with collisions', () => {
    const hashTable = new HashTable(3);

    expect(hashTable.hash('a')).toBe(1);
    expect(hashTable.hash('b')).toBe(2);
    expect(hashTable.hash('c')).toBe(0);
    expect(hashTable.hash('d')).toBe(1);

    hashTable.set('a', 'sky-old');
    hashTable.set('a', 'sky');
    hashTable.set('b', 'sea');
    hashTable.set('c', 'earth');
    hashTable.set('d', 'ocean');

    expect(hashTable.has('x')).toBe(false);
    expect(hashTable.has('b')).toBe(true);
    expect(hashTable.has('c')).toBe(true);

    const stringifier = (value) => `${value.key}:${value.value}`;

    expect(hashTable.buckets[0].toString(stringifier)).toBe('c:earth');
    expect(hashTable.buckets[1].toString(stringifier)).toBe('a:sky,d:ocean');
    expect(hashTable.buckets[2].toString(stringifier)).toBe('b:sea');

    expect(hashTable.get('a')).toBe('sky');
    expect(hashTable.get('d')).toBe('ocean');
    expect(hashTable.get('x')).toBeUndefined();

    hashTable.delete('a');

    expect(hashTable.delete('not-existing')).toBeNull();

    expect(hashTable.get('a')).toBeUndefined();
    expect(hashTable.get('d')).toBe('ocean');

    hashTable.set('d', 'ocean-new');
    expect(hashTable.get('d')).toBe('ocean-new');
  })