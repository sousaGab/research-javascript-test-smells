it('should promote references on a get.', function() {
    const assertListOrder = (head, expectedNodes) => {
        let currentNode = head;
        expectedNodes.forEach(node => {
            expect(currentNode[__key]).toBe(node.key);
            expect(currentNode.value).toEqual(node.value);
            currentNode = currentNode[__next];
        });
        expect(currentNode).toBeUndefined();
    };

    var model = new Model({
        cache: cacheGenerator(0, 1)
    });

    const initialOrder = [
        { key: 'title', value: 'Video 0' },
        { key: 'item', value: ['videos', '0'] },
        { key: '0', value: ['lists', 'A'] },
        { key: 'lolomo', value: ['lolomos', '1234'] }
    ];
    assertListOrder(model._root[__head], initialOrder);

    model.get(['lolomo', 0]).subscribe();

    const finalOrder = [
        { key: '0', value: ['lists', 'A'] },
        { key: 'lolomo', value: ['lolomos', '1234'] },
        { key: 'title', value: 'Video 0' },
        { key: 'item', value: ['videos', '0'] }
    ];
    assertListOrder(model._root[__head], finalOrder);
})