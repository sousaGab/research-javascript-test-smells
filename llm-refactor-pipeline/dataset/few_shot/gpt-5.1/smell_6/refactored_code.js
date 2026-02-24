it('should promote the get item to the head _toJSONG.', function() {
    var model = new Model();
    model.set({json: {1: 'I am 1'}}).subscribe();
    model.set({json: {2: 'I am 2'}}).subscribe();
    model.set({json: {3: 'I am 3'}}).subscribe();

    expect(model._root[__head].value).toBe('I am 3');
    expect(model._root[__head][__next].value).toBe('I am 2');
    expect(model._root[__head][__next][__next].value).toBe('I am 1');

    getWithPathsAsJSONGraph(model, [['2']], [{}]);
    getWithPathsAsJSONGraph(model, [['1']], [{}]);

    var current = model._root[__head];

    expect(current.value).toBe('I am 1');
    expect(current[__next].value).toBe('I am 2');
    expect(current[__next][__next].value).toBe('I am 3');
    expect(current[__next][__next][__next]).toBe(undefined);
    expect(current[__next][__next][__prev].value).toBe('I am 2');
    expect(current[__next][__next][__prev][__prev].value).toBe('I am 1');
    expect(current[__next][__next][__prev][__prev][__prev]).toBe(undefined);
});