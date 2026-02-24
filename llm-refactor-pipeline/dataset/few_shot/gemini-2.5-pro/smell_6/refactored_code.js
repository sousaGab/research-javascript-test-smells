it('should promote the get item to the head _toJSONG.', function() {
    const model = new Model();
    model.set({
        json: {
            1: 'I am 1'
        }
    }).subscribe();
    model.set({
        json: {
            2: 'I am 2'
        }
    }).subscribe();
    model.set({
        json: {
            3: 'I am 3'
        }
    }).subscribe();

    getWithPathsAsJSONGraph(model, [
        ['2']
    ], [{}]);
    getWithPathsAsJSONGraph(model, [
        ['1']
    ], [{}]);

    const head = model._root[__head];
    const middle = head[__next];
    const tail = middle[__next];

    expect(head.value).toBe('I am 1');
    expect(middle.value).toBe('I am 2');
    expect(tail.value).toBe('I am 3');

    expect(head[__prev]).toBe(undefined);
    expect(middle[__prev]).toBe(head);
    expect(tail[__prev]).toBe(middle);
    expect(tail[__next]).toBe(undefined);
})