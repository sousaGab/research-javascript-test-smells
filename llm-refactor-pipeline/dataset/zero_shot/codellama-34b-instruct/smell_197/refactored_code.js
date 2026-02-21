const MAPPED_COLLECTION_LENGTH = 2;
const MAPPED_NODES_INDEX_0 = 1;
const MAPPED_NODES_INDEX_1 = 0;

it('returns a new collection with mapped values', function() {
  const root = Collection.fromNodes(nodes);
  const mapped = root.map((_, i) => new NodePath(nodes[+!i]));

  expect(root).not.toBe(mapped);
  expect(mapped.length).toBe(MAPPED_COLLECTION_LENGTH);
  expect(mapped.nodes()[MAPPED_NODES_INDEX_0]).toBe(nodes[1]);
  expect(mapped.nodes()[MAPPED_NODES_INDEX_1]).toBe(nodes[0]);
})