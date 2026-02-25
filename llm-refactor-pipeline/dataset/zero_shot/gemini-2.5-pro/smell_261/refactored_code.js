test('onprocessfileabort', done => {
    // Ensure that the assertion in the callback is actually called
    expect.assertions(1);

    createPond();

    pond.onprocessfileabort = () => {
        // An explicit assertion makes the test's purpose clear:
        // it passes because this callback is executed.
        expect(true).toBe(true);
        done();
    };

    pond.files = [data];

    pond.getFile().abortProcessing();
});