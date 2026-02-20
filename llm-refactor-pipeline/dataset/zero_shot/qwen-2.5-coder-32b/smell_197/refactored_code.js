it('returns a new collection with mapped values', function() {
        const rootNodeIndex = 0;
        const mappedNodeIndex = 1;
        const expectedLength = 2;
        
        const root = Collection.fromNodes(nodes);
        const mapped = root.map((_, i) => new NodePath(nodes[+!i]));

        expect(root).not.toBe(mapped);
        expect(mapped.length).toBe(expectedLength);
        expect(mapped.nodes()[rootNodeIndex]).toBe(nodes[mappedNodeIndex]);
        expect(mapped.nodes()[mappedNodeIndex]).toBe(nodes[rootNodeIndex]);
      })