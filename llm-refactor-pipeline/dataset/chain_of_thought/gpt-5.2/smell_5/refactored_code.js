// Your COMPLETE refactored test code here
it('should promote references on a get.', function() {
    var model = new Model({
        cache: cacheGenerator(0, 1)
    });

    function expectListOrder(root, expected) {
        var curr = root[__head];
        for (var i = 0; i < expected.length; i++) {
            expect(curr).toBeDefined();
            expect(curr[__key]).toBe(expected[i].key);
            expect(curr.value).toEqual(expected[i].value);
            curr = curr[__next];
        }
        expect(curr).toBeUndefined();
    }

    var root = model._root;

    expectListOrder(root, [
        { key: 'title', value: 'Video 0' },
        { key: 'item', value: ['videos', '0'] },
        { key: '0', value: ['lists', 'A'] },
        { key: 'lolomo', value: ['lolomos', '1234'] }
    ]);

    model.get(['lolomo', 0]).subscribe();

    // new order to the list
    expectListOrder(root, [
        { key: '0', value: ['lists', 'A'] },
        { key: 'lolomo', value: ['lolomos', '1234'] },
        { key: 'title', value: 'Video 0' },
        { key: 'item', value: ['videos', '0'] }
    ]);
});