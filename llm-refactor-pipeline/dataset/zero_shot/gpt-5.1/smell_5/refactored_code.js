it('should promote references on a get.', function() {
    function expectListOrder(root, expectedOrder) {
        var curr = root[__head];
        expectedOrder.forEach(function(expectedNode, index) {
            if (expectedNode === null) {
                expect(curr).toBeUndefined();
                return;
            }
            expect(curr[__key]).toBe(expectedNode.key);
            expect(curr.value).toEqual(expectedNode.value);
            curr = curr[__next];
            if (index === expectedOrder.length - 1) {
                expect(curr).toBeUndefined();
            }
        });
    }

    var model = new Model({
        cache: cacheGenerator(0, 1)
    });

    var root = model._root;

    expectListOrder(root, [
        { key: 'title', value: 'Video 0' },
        { key: 'item', value: ['videos', '0'] },
        { key: '0', value: ['lists', 'A'] },
        { key: 'lolomo', value: ['lolomos', '1234'] }
    ]);

    model.get(['lolomo', 0]).subscribe();

    expectListOrder(root, [
        { key: '0', value: ['lists', 'A'] },
        { key: 'lolomo', value: ['lolomos', '1234'] },
        { key: 'title', value: 'Video 0' },
        { key: 'item', value: ['videos', '0'] }
    ]);
});