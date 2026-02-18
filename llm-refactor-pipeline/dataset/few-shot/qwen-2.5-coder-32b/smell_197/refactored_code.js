const EXPECTED_LENGTH = 2;
const FIRST_NODE_INDEX = 1;
const SECOND_NODE_INDEX = 0;

it('returns a new collection with mapped values', function() {
        const root = Collection.fromNodes(nodes);
        const mapped = root.map((_, i) => new NodePath(nodes[+!i]));

        expect(root).not.toBe(mapped);
        expect(mapped.length).toBe(EXPECTED_LENGTH);
        expect(mapped.nodes()[0]).toBe(nodes[FIRST_NODE_INDEX]);
        expect(mapped.nodes()[1]).toBe(nodes[SECOND_NODE_INDEX]);
      })