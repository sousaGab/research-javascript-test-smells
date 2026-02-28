const COLLECTION_LENGTH = 2;
const FIRST_NODE_INDEX = 0;
const SECOND_NODE_INDEX = 1;

it('returns a new collection with mapped values', function() {
    const root = Collection.fromNodes(nodes);
    const mapped = root.map((_, i) => new NodePath(nodes[+!i]));

    expect(root).not.toBe(mapped);
    expect(mapped.length).toBe(COLLECTION_LENGTH);
    expect(mapped.nodes()[FIRST_NODE_INDEX]).toBe(nodes[SECOND_NODE_INDEX]);
    expect(mapped.nodes()[SECOND_NODE_INDEX]).toBe(nodes[FIRST_NODE_INDEX]);
})