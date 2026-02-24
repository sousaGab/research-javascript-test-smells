it('returns a new collection with mapped values', function() {
        const root = Collection.fromNodes(nodes);
        const firstIndex = 0;
        const secondIndex = 1;
        const expectedLength = 2;
        const mapped = root.map((_, i) => new NodePath(nodes[+!i]));

        expect(root).not.toBe(mapped);
        expect(mapped.length).toBe(expectedLength);
        expect(mapped.nodes()[firstIndex]).toBe(nodes[secondIndex]);
        expect(mapped.nodes()[secondIndex]).toBe(nodes[firstIndex]);
      })