it('should promote the get item to the head _toJSONG.', function() {
    var model = new Model();
    model.set({json: {1: 'I am 1'}}).subscribe();
    model.set({json: {2: 'I am 2'}}).subscribe();
    model.set({json: {3: 'I am 3'}}).subscribe();

    var assertNode = function(node, expectedValue, hasNext, hasPrev) {
        expect(node.value).toBe(expectedValue);
        if (hasNext !== undefined) {
            if (hasNext) {
                expect(node[__next]).toBeDefined();
            } else {
                expect(node[__next]).toBe(undefined);
            }
        }
        if (hasPrev !== undefined) {
            if (hasPrev) {
                expect(node[__prev]).toBeDefined();
            } else {
                expect(node[__prev]).toBe(undefined);
            }
        }
    };

    // Initial order: 3 -> 2 -> 1
    var head = model._root[__head];
    assertNode(head, 'I am 3', true, false);
    assertNode(head[__next], 'I am 2', true, true);
    assertNode(head[__next][__next], 'I am 1', false, true);

    getWithPathsAsJSONGraph(model, [['2']], [{}]);
    getWithPathsAsJSONGraph(model, [['1']], [{}]);

    // Expected order after access: 1 <-> 2 <-> 3
    var current = model._root[__head];
    assertNode(current, 'I am 1', true, false);

    current = current[__next];
    assertNode(current, 'I am 2', true, true);

    current = current[__next];
    assertNode(current, 'I am 3', false, true);
});