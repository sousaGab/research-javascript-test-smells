it('should promote references on a get.', function() {
        var model = new Model({
            cache: cacheGenerator(0, 1)
        });

        var root = model._root;
        var curr = root[__head];

        var initialOrder = [
            { key: 'title', value: 'Video 0' },
            { key: 'item', value: ['videos', '0'] },
            { key: '0', value: ['lists', 'A'] },
            { key: 'lolomo', value: ['lolomos', '1234'] }
        ];

        initialOrder.forEach(function(expected) {
            expect(curr[__key]).toBe(expected.key);
            expect(curr.value).toEqual(expected.value);
            curr = curr[__next];
        });
        expect(curr).toBeUndefined();

        model.get(['lolomo', 0]).subscribe();

        var newOrder = [
            { key: '0', value: ['lists', 'A'] },
            { key: 'lolomo', value: ['lolomos', '1234'] },
            { key: 'title', value: 'Video 0' },
            { key: 'item', value: ['videos', '0'] }
        ];

        curr = root[__head];
        newOrder.forEach(function(expected) {
            expect(curr[__key]).toBe(expected.key);
            expect(curr.value).toEqual(expected.value);
            curr = curr[__next];
        });
        expect(curr).toBeUndefined();
    })