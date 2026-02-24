it('should set, read and delete data with collisions', () => {
  const hashTable = new HashTable(3);
  const stringifier = (value) => `${value.key}:${value.value}`;

  const expectHash = (key, expectedIndex) => {
    expect(hashTable.hash(key)).toBe(expectedIndex);
  };

  const expectHas = (key, expected) => {
    expect(hashTable.has(key)).toBe(expected);
  };

  const expectBucketToString = (bucketIndex, expectedString) => {
    expect(hashTable.buckets[bucketIndex].toString(stringifier)).toBe(expectedString);
  };

  const expectGet = (key, expectedValue) => {
    expect(hashTable.get(key)).toBe(expectedValue);
  };

  const expectGetNotDefined = (key) => {
    expect(hashTable.get(key)).not.toBeDefined();
  };

  expectHash('a', 1);
  expectHash('b', 2);
  expectHash('c', 0);
  expectHash('d', 1);

  hashTable.set('a', 'sky-old');
  hashTable.set('a', 'sky');
  hashTable.set('b', 'sea');
  hashTable.set('c', 'earth');
  hashTable.set('d', 'ocean');

  expectHas('x', false);
  expectHas('b', true);
  expectHas('c', true);

  expectBucketToString(0, 'c:earth');
  expectBucketToString(1, 'a:sky,d:ocean');
  expectBucketToString(2, 'b:sea');

  expectGet('a', 'sky');
  expectGet('d', 'ocean');
  expectGetNotDefined('x');

  hashTable.delete('a');

  expect(hashTable.delete('not-existing')).toBeNull();

  expectGetNotDefined('a');
  expectGet('d', 'ocean');

  hashTable.set('d', 'ocean-new');
  expectGet('d', 'ocean-new');
});