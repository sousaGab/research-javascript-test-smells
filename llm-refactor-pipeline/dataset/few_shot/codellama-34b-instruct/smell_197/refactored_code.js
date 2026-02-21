it('returns a new collection with mapped values', function() {
        const root = Collection.fromNodes(nodes);
        const mapped = root.map((_, i) => new NodePath(nodes[+!i]));

        expect(root).not.toBe(mapped);
        expect(mapped.length).toBe(2);
        expect(mapped.nodes()[0]).toBe(nodes[1]);
        expect(mapped.nodes()[1]).toBe(nodes[0]);
      })