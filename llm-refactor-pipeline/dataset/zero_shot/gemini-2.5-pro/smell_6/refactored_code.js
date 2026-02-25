it('should promote the get item to the head _toJSONG.', function() {
    const assertListOrder = (model, expectedOrder) => {
        const forwardValues = [];
        let current = model._root[__head];
        let tail;

        while (current) {
            forwardValues.push(current.value);
            if (!current[__next]) {
                tail = current;
            }
            current = current[__next];
        }
        expect(forwardValues).toEqual(expectedOrder);

        const backwardValues = [];
        current = tail;
        while (current) {
            backwardValues.push(current.value);
            current = current[__prev];
        }
        expect(backwardValues).toEqual([...expectedOrder].reverse());
    };

    var model = new Model();
    model.set({json: {1: 'I am 1'}}).subscribe();
    model.set({json: {2: 'I am 2'}}).subscribe();
    model.set({json: {3: 'I am 3'}}).subscribe();

    assertListOrder(model, ['I am 3', 'I am 2', 'I am 1']);

    getWithPathsAsJSONGraph(model, [['2']], [{}]);
    getWithPathsAsJSONGraph(model, [['1']], [{}]);

    assertListOrder(model, ['I am 1', 'I am 2', 'I am 3']);
});