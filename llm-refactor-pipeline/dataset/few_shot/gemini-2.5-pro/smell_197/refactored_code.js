it('returns a new collection with mapped values', function() {
  const root = Collection.fromNodes(nodes);
  const EXPECTED_LENGTH = 2;
  const originalFirstNode = nodes[0];
  const originalSecondNode = nodes[1];

  // This mapping function swaps the order of the two nodes
  const mapped = root.map((_, i) => new NodePath(nodes[1 - i]));

  expect(root).not.toBe(mapped);
  expect(mapped.length).toBe(EXPECTED_LENGTH);
  expect(mapped.nodes()[0]).toBe(originalSecondNode);
  expect(mapped.nodes()[1]).toBe(originalFirstNode);
})