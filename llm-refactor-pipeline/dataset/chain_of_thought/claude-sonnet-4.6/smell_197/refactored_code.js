const MAPPED_COLLECTION_LENGTH = 2;
const FIRST_INDEX = 0;
const SECOND_INDEX = 1;

it('returns a new collection with mapped values', function() {
  const root = Collection.fromNodes(nodes);
  const mapped = root.map((_, i) => new NodePath(nodes[+!i]));

  expect(root).not.toBe(mapped);
  expect(mapped.length).toBe(MAPPED_COLLECTION_LENGTH);
  expect(mapped.nodes()[FIRST_INDEX]).toBe(nodes[SECOND_INDEX]);
  expect(mapped.nodes()[SECOND_INDEX]).toBe(nodes[FIRST_INDEX]);
});