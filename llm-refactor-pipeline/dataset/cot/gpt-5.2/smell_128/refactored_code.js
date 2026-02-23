it('should set, read and delete data with collisions', () => {
  const hashTable = new HashTable(3);

  const expectHashes = (pairs) => {
    pairs.forEach(([key, expectedHash]) => {
      expect(hashTable.hash(key)).toBe(expectedHash);
    });
  };

  const setEntries = (pairs) => {
    pairs.forEach(([key, value]) => {
      hashTable.set(key, value);
    });
  };

  const expectHas = (pairs) => {
    pairs.forEach(([key, expected]) => {
      expect(hashTable.has(key)).toBe(expected);
    });
  };

  const stringifier = (value) => `${value.key}:${value.value}`;
  const expectBucketsToString = (expectedByIndex) => {
    Object.entries(expectedByIndex).forEach(([index, expectedString]) => {
      expect(hashTable.buckets[Number(index)].toString(stringifier)).toBe(expectedString);
    });
  };

  const expectGets = (pairs) => {
    pairs.forEach(([key, expectedValue]) => {
      if (expectedValue === undefined) {
        expect(hashTable.get(key)).not.toBeDefined();
      } else {
        expect(hashTable.get(key)).toBe(expectedValue);
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

  expectHas([
    ['x', false],
    ['b', true],
    ['c', true],
  ]);

  expectBucketsToString({
    0: 'c:earth',
    1: 'a:sky,d:ocean',
    2: 'b:sea',
  });

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