it('returns a new collection with mapped values', function() {
  const root = Collection.fromNodes(nodes);
  const firstNode = nodes[0];
  const secondNode = nodes[1];

  // The map function swaps the order of the nodes.
  const mapped = root.map((_, index) => {
    const isFirstIteration = index === 0;
    const nodeForPath = isFirstIteration ? secondNode : firstNode;
    return new NodePath(nodeForPath);
  });

  expect(root).not.toBe(mapped);
  expect(mapped.length).toBe(nodes.length);
  expect(mapped.nodes()[0]).toBe(secondNode);
  expect(mapped.nodes()[1]).toBe(firstNode);
});