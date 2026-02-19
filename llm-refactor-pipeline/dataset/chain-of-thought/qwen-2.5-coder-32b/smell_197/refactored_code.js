it('returns a new collection with mapped values', function() {
        const rootNodeIndex = 0;
        const otherNodeIndex = 1;
        const expectedMappedLength = 2;
        
        const root = Collection.fromNodes(nodes);
        const mapped = root.map((_, i) => new NodePath(nodes[+!i]));

        expect(root).not.toBe(mapped);
        expect(mapped.length).toBe(expectedMappedLength);
        expect(mapped.nodes()[rootNodeIndex]).toBe(nodes[otherNodeIndex]);
        expect(mapped.nodes()[otherNodeIndex]).toBe(nodes[rootNodeIndex]);
      })