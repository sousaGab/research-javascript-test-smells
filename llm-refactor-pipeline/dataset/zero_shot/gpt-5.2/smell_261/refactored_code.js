test('onprocessfileabort', done => {
    expect.assertions(1);

    createPond();

    pond.onprocessfileabort = () => {
        expect(true).toBe(true);
        done();
    };

    pond.files = [data];
    pond.getFile().abortProcessing();
});