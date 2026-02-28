it('returns a new collection with mapped values', function() {
  const root = Collection.fromNodes(nodes);
  const mapped = root.map((_, i) => new NodePath(nodes[+!i]));

  expect(root).not.toBe(mapped);
  expect(mapped.length).toBe(nodes.length);
  expect(mapped.nodes()).toEqual([nodes[1], nodes[0]]);
})