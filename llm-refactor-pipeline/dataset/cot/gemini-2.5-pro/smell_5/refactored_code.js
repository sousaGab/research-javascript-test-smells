it('should promote references on a get.', function() {
    const model = new Model({
        cache: cacheGenerator(0, 1)
    });
    const root = model._root;

    const assertListOrder = (head, expectedOrder) => {
        let curr = head;
        for (const {
                key,
                value
            } of expectedOrder) {
            expect(curr[__key]).toBe(key);
            expect(curr.value).toEqual(value);
            curr = curr[__next];
        }
        expect(curr).toBeUndefined();
    };

    const initialOrder = [{
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

    assertListOrder(root[__head], initialOrder);

    model.get(['lolomo', 0]).subscribe();

    const promotedOrder = [{
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

    assertListOrder(root[__head], promotedOrder);
})