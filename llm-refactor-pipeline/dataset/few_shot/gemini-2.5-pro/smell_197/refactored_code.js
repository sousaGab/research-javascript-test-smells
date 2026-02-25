it('returns a new collection with the nodes swapped', function() {
  const root = Collection.fromNodes(nodes);
  const firstNode = nodes[0];
  const secondNode = nodes[1];
  const EXPECTED_LENGTH = 2;

  // The map function swaps the two nodes.
  // For i=0, it uses nodes[1]. For i=1, it uses nodes[0].
  const mapped = root.map((_, i) => new NodePath(nodes[1 - i]));

  expect(root).not.toBe(mapped);
  expect(mapped.length).toBe(EXPECTED_LENGTH);
  expect(mapped.nodes()[0]).toBe(secondNode);
  expect(mapped.nodes()[1]).toBe(firstNode);
})