it('should promote references on a get.', function() {
    var model = new Model({
        cache: cacheGenerator(0, 1)
    });

    var root = model._root;
    var curr = root[__head];

    const assertNode = (node, expectedKey, expectedValue, expectNextUndefined = false) => {
        expect(node[__key]).toBe(expectedKey);
        expect(node.value).toEqual(expectedValue);
        if (expectNextUndefined) {
            expect(node[__next]).toBeUndefined();
        }
    };

    assertNode(curr, 'title', 'Video 0');

    curr = curr[__next];
    assertNode(curr, 'item', ['videos', '0']);

    curr = curr[__next];
    assertNode(curr, '0', ['lists', 'A']);

    curr = curr[__next];
    assertNode(curr, 'lolomo', ['lolomos', '1234'], true);

    model.get(['lolomo', 0]).subscribe();

    // new order to the list
    curr = root[__head];
    assertNode(curr, '0', ['lists', 'A']);

    curr = curr[__next];
    assertNode(curr, 'lolomo', ['lolomos', '1234']);

    curr = curr[__next];
    assertNode(curr, 'title', 'Video 0');

    curr = curr[__next];
    assertNode(curr, 'item', ['videos', '0'], true);
});