it('returns a new collection with mapped values', function() {
  const root = Collection.fromNodes(nodes);
  const FIRST_NODE_INDEX = 0;
  const SECOND_NODE_INDEX = 1;
  const EXPECTED_COLLECTION_LENGTH = 2;

  const mapped = root.map((_, i) => {
    const swappedIndex = i === FIRST_NODE_INDEX ? SECOND_NODE_INDEX : FIRST_NODE_INDEX;
    return new NodePath(nodes[swappedIndex]);
  });

  expect(root).not.toBe(mapped);
  expect(mapped.length).toBe(EXPECTED_COLLECTION_LENGTH);
  expect(mapped.nodes()[FIRST_NODE_INDEX]).toBe(nodes[SECOND_NODE_INDEX]);
  expect(mapped.nodes()[SECOND_NODE_INDEX]).toBe(nodes[FIRST_NODE_INDEX]);
})