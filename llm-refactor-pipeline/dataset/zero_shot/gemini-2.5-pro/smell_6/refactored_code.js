it('should promote the get item to the head _toJSONG.', function() {
    var model = new Model();
    model.set({json: {1: 'I am 1'}}).subscribe();
    model.set({json: {2: 'I am 2'}}).subscribe();
    model.set({json: {3: 'I am 3'}}).subscribe();

    const getOrderedValues = (startNode, direction) => {
        const values = [];
        let current = startNode;
        while (current) {
            values.push(current.value);
            current = current[direction];
        }
        return values;
    };

    expect(getOrderedValues(model._root[__head], __next)).toEqual([
        'I am 3', 'I am 2', 'I am 1'
    ]);

    getWithPathsAsJSONGraph(model, [['2']], [{}]);
    getWithPathsAsJSONGraph(model, [['1']], [{}]);

    const head = model._root[__head];
    expect(getOrderedValues(head, __next)).toEqual([
        'I am 1', 'I am 2', 'I am 3'
    ]);

    let tail = head;
    while (tail && tail[__next]) {
        tail = tail[__next];
    }
    expect(getOrderedValues(tail, __prev)).toEqual([
        'I am 3', 'I am 2', 'I am 1'
    ]);
});