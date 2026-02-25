it('should trigger both handlers', function (done) {
    var handler1Called = false;
    var handler2Called = false;

    var checkDone = function () {
        if (handler1Called && handler2Called) {
            expect(handler1Called).toBe(true);
            expect(handler2Called).toBe(true);
            done();
        }
    };

    list.on('updated', function (list) {
        handler1Called = true;
        checkDone();
    });

    list.on('updated', function (list) {
        handler2Called = true;
        checkDone();
    });

    list.search('jonny');
});