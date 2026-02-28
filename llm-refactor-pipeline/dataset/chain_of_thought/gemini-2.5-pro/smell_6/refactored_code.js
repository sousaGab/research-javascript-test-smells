it('should promote the get item to the head _toJSONG.', function() {
    var model = new Model();
    model.set({json: {1: 'I am 1'}}).subscribe();
    model.set({json: {2: 'I am 2'}}).subscribe();
    model.set({json: {3: 'I am 3'}}).subscribe();

    // Assert initial state: 3 -> 2 -> 1
    expect(model._root[__head].value).toBe('I am 3');
    expect(model._root[__head][__next].value).toBe('I am 2');
    expect(model._root[__head][__next][__next].value).toBe('I am 1');

    // Act: Promote 2, then 1
    getWithPathsAsJSONGraph(model, [['2']], [{}]);
    getWithPathsAsJSONGraph(model, [['1']], [{}]);

    // Assert final state and list integrity: 1 <-> 2 <-> 3
    const head = model._root[__head];
    const node2 = head[__next];
    const tail = node2[__next];

    // Assert forward order and values
    expect(head.value).toBe('I am 1');
    expect(node2.value).toBe('I am 2');
    expect(tail.value).toBe('I am 3');
    expect(tail[__next]).toBe(undefined);

    // Assert backward links
    expect(head[__prev]).toBe(undefined);
    expect(node2[__prev]).toBe(head);
    expect(tail[__prev]).toBe(node2);
})