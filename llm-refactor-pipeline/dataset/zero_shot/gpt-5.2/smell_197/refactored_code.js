it('returns a new collection with mapped values', function() {
  const root = Collection.fromNodes(nodes);

  const FIRST_INDEX = 0;
  const SECOND_INDEX = 1;
  const EXPECTED_LENGTH = 2;

  const mapped = root.map((_, i) => {
    const isFirst = i === FIRST_INDEX;
    const targetIndex = isFirst ? SECOND_INDEX : FIRST_INDEX;
    return new NodePath(nodes[targetIndex]);
  });

  expect(root).not.toBe(mapped);
  expect(mapped.length).toBe(EXPECTED_LENGTH);
  expect(mapped.nodes()[FIRST_INDEX]).toBe(nodes[SECOND_INDEX]);
  expect(mapped.nodes()[SECOND_INDEX]).toBe(nodes[FIRST_INDEX]);
});