it('should set, read and delete data with collisions', () => {
  const hashTable = new HashTable(3);
  const stringifier = (value) => `${value.key}:${value.value}`;

  const expectHashes = (entries) => {
    entries.forEach(([key, expectedHash]) => {
      expect(hashTable.hash(key)).toBe(expectedHash);
    });
  };

  const setEntries = (entries) => {
    entries.forEach(([key, value]) => {
      hashTable.set(key, value);
    });
  };

  const expectHasFlags = (entries) => {
    entries.forEach(([key, expected]) => {
      expect(hashTable.has(key)).toBe(expected);
    });
  };

  const expectBucketStrings = (expectedBuckets) => {
    expectedBuckets.forEach(([index, expectedString]) => {
      expect(hashTable.buckets[index].toString(stringifier)).toBe(expectedString);
    });
  };

  const expectGets = (entries) => {
    entries.forEach(([key, expected]) => {
      if (expected === undefined) {
        expect(hashTable.get(key)).not.toBeDefined();
      } else {
        expect(hashTable.get(key)).toBe(expected);
      }
    });
  };

  expectHashes([
    ['a', 1],
    ['b', 2],
    ['c', 0],
    ['d', 1],
  ]);

  setEntries([
    ['a', 'sky-old'],
    ['a', 'sky'],
    ['b', 'sea'],
    ['c', 'earth'],
    ['d', 'ocean'],
  ]);

  expectHasFlags([
    ['x', false],
    ['b', true],
    ['c', true],
  ]);

  expectBucketStrings([
    [0, 'c:earth'],
    [1, 'a:sky,d:ocean'],
    [2, 'b:sea'],
  ]);

  expectGets([
    ['a', 'sky'],
    ['d', 'ocean'],
    ['x', undefined],
  ]);

  hashTable.delete('a');
  expect(hashTable.delete('not-existing')).toBeNull();

  expectGets([
    ['a', undefined],
    ['d', 'ocean'],
  ]);

  hashTable.set('d', 'ocean-new');
  expect(hashTable.get('d')).toBe('ocean-new');
});