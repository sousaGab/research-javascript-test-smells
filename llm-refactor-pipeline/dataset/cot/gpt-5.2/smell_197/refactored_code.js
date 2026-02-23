it('returns a new collection with mapped values', function () {
  const root = Collection.fromNodes(nodes);

  const FIRST_INDEX = 0;
  const SECOND_INDEX = 1;
  const EXPECTED_MAPPED_LENGTH = 2;

  const mapped = root.map((_, index) => {
    const targetNodeIndex = index === FIRST_INDEX ? SECOND_INDEX : FIRST_INDEX;
    return new NodePath(nodes[targetNodeIndex]);
  });

  expect(root).not.toBe(mapped);
  expect(mapped.length).toBe(EXPECTED_MAPPED_LENGTH);
  expect(mapped.nodes()[FIRST_INDEX]).toBe(nodes[SECOND_INDEX]);
  expect(mapped.nodes()[SECOND_INDEX]).toBe(nodes[FIRST_INDEX]);
});