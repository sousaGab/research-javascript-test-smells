it('should promote references on a get.', function() {
    var model = new Model({
        cache: cacheGenerator(0, 1)
    });

    var root = model._root;
    var curr = root[__head];
    expect(curr[__key]).toBe('title');
    expect(curr.value).toEqual('Video 0');

    curr = curr[__next];
    expect(curr[__key]).toBe('item');
    expect(curr.value).toEqual(['videos', '0']);

    curr = curr[__next];
    expect(curr[__key]).toBe('0');
    expect(curr.value).toEqual(['lists', 'A']);

    curr = curr[__next];
    expect(curr[__key]).toBe('lolomo');
    expect(curr.value).toEqual(['lolomos', '1234']);
    expect(curr[__next]).toBeUndefined();

    model.get(['lolomo', 0]).subscribe();

    // Verify the new order after promotion
    var verifyOrder = function(expectedItems) {
        var current = root[__head];
        expectedItems.forEach(function(item) {
            expect(current[__key]).toBe(item.key);
            expect(current.value).toEqual(item.value);
            current = current[__next];
        });
        expect(current).toBeUndefined();
    };

    verifyOrder([
        { key: '0', value: ['lists', 'A'] },
        { key: 'lolomo', value: ['lolomos', '1234'] },
        { key: 'title', value: 'Video 0' },
        { key: 'item', value: ['videos', '0'] }
    ]);
});