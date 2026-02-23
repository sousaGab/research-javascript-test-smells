// Your COMPLETE refactored test code here

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

    // new order to the list
    curr = root[__head];
    expect(curr[__key]).toBe('0');
    expect(curr.value).toEqual(['lists', 'A']);

    curr = curr[__next];
    expect(curr[__key]).toBe('lolomo');
    expect(curr.value).toEqual(['lolomos', '1234']);

    curr = curr[__next];
    expect(curr[__key]).toBe('title');
    expect(curr.value).toEqual('Video 0');

    curr = curr[__next];
    expect(curr[__key]).toBe('item');
    expect(curr.value).toEqual(['videos', '0']);
    expect(curr[__next]).toBeUndefined();
})