it('should promote references on a get.', function() {
    const assertLinkedListState = (head, expectedNodes) => {
        let currentNode = head;
        for (const {
                key,
                value
            } of expectedNodes) {
            expect(currentNode).toBeDefined();
            expect(currentNode[__key]).toBe(key);
            expect(currentNode.value).toEqual(value);
            currentNode = currentNode[__next];
        }
        expect(currentNode).toBeUndefined();
    };

    const model = new Model({
        cache: cacheGenerator(0, 1)
    });

    const root = model._root;

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

    assertLinkedListState(root[__head], initialState);

    model.get(['lolomo', 0]).subscribe();

    const promotedState = [{
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

    assertLinkedListState(root[__head], promotedState);
});