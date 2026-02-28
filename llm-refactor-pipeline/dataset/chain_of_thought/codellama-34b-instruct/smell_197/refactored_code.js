it('returns a new collection with mapped values', function() {
    const ORIGINAL_NODES = [
        { id: 1, name: 'Node 1' },
        { id: 2, name: 'Node 2' },
    ];
    const EXPECTED_MAPPED_NODES = [
        { id: 2, name: 'Node 2' },
        { id: 1, name: 'Node 1' },
    ];

    const root = Collection.fromNodes(ORIGINAL_NODES);
    const mapped = root.map((_, i) => new NodePath(ORIGINAL_NODES[+!i]));

    expect(root).not.toBe(mapped);
    expect(mapped.length).toBe(2);
    expect(mapped.nodes()[0]).toBe(EXPECTED_MAPPED_NODES[0]);
    expect(mapped.nodes()[1]).toBe(EXPECTED_MAPPED_NODES[1]);
});