it('should promote references on a get.', function() {
    function expectNode(curr, expectedKey, expectedValue) {
        expect(curr[__key]).toBe(expectedKey);
        expect(curr.value).toEqual(expectedValue);
    }

    var model = new Model({
        cache: cacheGenerator(0, 1)
    });

    var root = model._root;
    var curr = root[__head];

    expectNode(curr, 'title', 'Video 0');

    curr = curr[__next];
    expectNode(curr, 'item', ['videos', '0']);

    curr = curr[__next];
    expectNode(curr, '0', ['lists', 'A']);

    curr = curr[__next];
    expectNode(curr, 'lolomo', ['lolomos', '1234']);
    expect(curr[__next]).toBeUndefined();

    model.get(['lolomo', 0]).subscribe();

    // new order to the list
    curr = root[__head];
    expectNode(curr, '0', ['lists', 'A']);

    curr = curr[__next];
    expectNode(curr, 'lolomo', ['lolomos', '1234']);

    curr = curr[__next];
    expectNode(curr, 'title', 'Video 0');

    curr = curr[__next];
    expectNode(curr, 'item', ['videos', '0']);
    expect(curr[__next]).toBeUndefined();
});