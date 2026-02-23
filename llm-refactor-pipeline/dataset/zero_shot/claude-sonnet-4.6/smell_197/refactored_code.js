it('returns a new collection with mapped values', function() {
        const root = Collection.fromNodes(nodes);
        const firstNode = nodes[0];
        const secondNode = nodes[1];
        const expectedLength = 2;
        const firstIndex = 0;
        const secondIndex = 1;
        const mapped = root.map((_, i) => new NodePath(i === 0 ? secondNode : firstNode));

        expect(root).not.toBe(mapped);
        expect(mapped.length).toBe(expectedLength);
        expect(mapped.nodes()[firstIndex]).toBe(secondNode);
        expect(mapped.nodes()[secondIndex]).toBe(firstNode);
      })