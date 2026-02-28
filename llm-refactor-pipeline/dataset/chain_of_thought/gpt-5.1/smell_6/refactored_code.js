it('should promote the get item to the head _toJSONG.', function() {
    function expectListOrderFromHead(head, expectedValues) {
        var current = head;
        expectedValues.forEach(function(value, index) {
            expect(current.value).toBe(value);
            if (index < expectedValues.length - 1) {
                current = current[__next];
            }
        });
        expect(current[__next]).toBe(undefined);
    }

    function expectListOrderFromTail(tail, expectedValuesReversed) {
        var current = tail;
        expectedValuesReversed.forEach(function(value, index) {
            expect(current.value).toBe(value);
            if (index < expectedValuesReversed.length - 1) {
                current = current[__prev];
            }
        });
        expect(current[__prev]).toBe(undefined);
    }

    var model = new Model();
    model.set({json: {1: 'I am 1'}}).subscribe();
    model.set({json: {2: 'I am 2'}}).subscribe();
    model.set({json: {3: 'I am 3'}}).subscribe();

    expectListOrderFromHead(model._root[__head], ['I am 3', 'I am 2', 'I am 1']);

    getWithPathsAsJSONGraph(model, [['2']], [{}]);
    getWithPathsAsJSONGraph(model, [['1']], [{}]);

    var head = model._root[__head];
    expectListOrderFromHead(head, ['I am 1', 'I am 2', 'I am 3']);

    var tail = head[__next][__next];
    expectListOrderFromTail(tail, ['I am 3', 'I am 2', 'I am 1']);
});