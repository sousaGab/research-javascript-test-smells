it('should promote references on a get.', function() {
    const assertLinkedListState = (startNode, expectedNodes) => {
        let currentNode = startNode;
        for (const expectedNode of expectedNodes) {
            expect(currentNode).toBeDefined();
            expect(currentNode[__key]).toBe(expectedNode.key);
            expect(currentNode.value).toEqual(expectedNode.value);
            currentNode = currentNode[__next];
        }
        expect(currentNode).toBeUndefined();
    };

    var model = new Model({
        cache: cacheGenerator(0, 1)
    });

    const initialState = [{
        key: 'title',
        value: 'Video 0'
    }, {
        key: 'item',
        value: ['videos', '0']
    }, {
        key: '0',
        value: ['lists', 'A']
    }, {
        key: 'lolomo',
        value: ['lolomos', '1234']
    }, ];
    assertLinkedListState(model._root[__head], initialState);

    model.get(['lolomo', 0]).subscribe();

    const finalState = [{
        key: '0',
        value: ['lists', 'A']
    }, {
        key: 'lolomo',
        value: ['lolomos', '1234']
    }, {
        key: 'title',
        value: 'Video 0'
    }, {
        key: 'item',
        value: ['videos', '0']
    }, ];
    assertLinkedListState(model._root[__head], finalState);
});