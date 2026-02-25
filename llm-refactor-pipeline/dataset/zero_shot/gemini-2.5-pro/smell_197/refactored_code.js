it('returns a new collection with mapped values', function() {
  const [firstNode, secondNode] = nodes;
  const root = Collection.fromNodes(nodes);
  const expectedLength = nodes.length;

  // Map callback swaps the order of the two nodes
  const mapped = root.map((node, index) => {
    const isFirstElement = index === 0;
    const swappedNode = isFirstElement ? secondNode : firstNode;
    return new NodePath(swappedNode);
  });

  const mappedNodes = mapped.nodes();

  expect(root).not.toBe(mapped);
  expect(mapped.length).toBe(expectedLength);
  expect(mappedNodes[0]).toBe(secondNode);
  expect(mappedNodes[1]).toBe(firstNode);
});