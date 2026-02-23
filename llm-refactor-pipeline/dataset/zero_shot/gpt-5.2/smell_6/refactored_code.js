it('should promote the get item to the head _toJSONG.', function() {
    var model = new Model();
    model.set({ json: { 1: 'I am 1' } }).subscribe();
    model.set({ json: { 2: 'I am 2' } }).subscribe();
    model.set({ json: { 3: 'I am 3' } }).subscribe();

    function expectListFromHead(values) {
        var node = model._root[__head];
        for (var i = 0; i < values.length; i++) {
            expect(node.value).toBe(values[i]);
            node = node[__next];
        }
        expect(node).toBe(undefined);
    }

    function expectListFromTail(values) {
        var node = model._root[__tail];
        for (var i = 0; i < values.length; i++) {
            expect(node.value).toBe(values[i]);
            node = node[__prev];
        }
        expect(node).toBe(undefined);
    }

    expectListFromHead(['I am 3', 'I am 2', 'I am 1']);

    getWithPathsAsJSONGraph(model, [['2']], [{}]);
    getWithPathsAsJSONGraph(model, [['1']], [{}]);

    expectListFromHead(['I am 1', 'I am 2', 'I am 3']);
    expectListFromTail(['I am 3', 'I am 2', 'I am 1']);
});