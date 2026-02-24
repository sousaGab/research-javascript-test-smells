it('should trigger both handlers', function (done) {
    let callCount = 0;

    const checkDone = () => {
        // This function is called from both handlers.
        // When the count reaches 2, we know both have executed.
        if (callCount === 2) {
            expect(callCount).toBe(2);
            done();
        }
    };

    list.on('updated', () => {
        callCount++;
        checkDone();
    });

    list.on('updated', () => {
        callCount++;
        checkDone();
    });

    list.search('jonny');
});