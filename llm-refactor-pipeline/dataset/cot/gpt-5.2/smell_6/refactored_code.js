// Your COMPLETE refactored test code here
it('should promote the get item to the head _toJSONG.', function() {
    function expectListValuesFromHead(root, expectedValues) {
        var node = root[__head];
        for (var i = 0; i < expectedValues.length; i++) {
            expect(node.value).toBe(expectedValues[i]);
            node = node[__next];
        }
        expect(node).toBe(undefined);
    }

    function expectListValuesFromTail(root, expectedValues) {
        var node = root[__tail];
        for (var i = 0; i < expectedValues.length; i++) {
            expect(node.value).toBe(expectedValues[i]);
            node = node[__prev];
        }
        expect(node).toBe(undefined);
    }

    var model = new Model();
    model.set({json: {1: 'I am 1'}}).subscribe();
    model.set({json: {2: 'I am 2'}}).subscribe();
    model.set({json: {3: 'I am 3'}}).subscribe();

    expectListValuesFromHead(model._root, ['I am 3', 'I am 2', 'I am 1']);

    getWithPathsAsJSONGraph(model, [['2']], [{}]);
    getWithPathsAsJSONGraph(model, [['1']], [{}]);

    expectListValuesFromHead(model._root, ['I am 1', 'I am 2', 'I am 3']);
    expectListValuesFromTail(model._root, ['I am 3', 'I am 2', 'I am 1']);
});