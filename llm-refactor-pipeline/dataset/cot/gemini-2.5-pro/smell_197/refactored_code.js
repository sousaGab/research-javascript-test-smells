it('returns a new collection with mapped values', function() {
  const root = Collection.fromNodes(nodes);
  const [firstNode, secondNode] = nodes;
  const EXPECTED_LENGTH = 2;

  // The mapping function reverses the order of the two nodes
  const mapped = root.map((_, index) => {
    const isFirstElement = index === 0;
    const nodeForPath = isFirstElement ? secondNode : firstNode;
    return new NodePath(nodeForPath);
  });

  expect(root).not.toBe(mapped);
  expect(mapped.length).toBe(EXPECTED_LENGTH);

  const mappedNodes = mapped.nodes();
  const firstMappedNode = mappedNodes[0];
  const secondMappedNode = mappedNodes[1];

  expect(firstMappedNode).toBe(secondNode);
  expect(secondMappedNode).toBe(firstNode);
});