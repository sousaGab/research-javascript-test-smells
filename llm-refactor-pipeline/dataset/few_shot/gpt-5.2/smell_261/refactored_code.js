test('onprocessfileabort', done => {
    createPond();

    expect(typeof pond.onprocessfileabort).not.toBe('function');

    pond.onprocessfileabort = () => {
        expect(pond.getFile()).toBeDefined();
        done();
    };

    pond.files = [data];

    pond.getFile().abortProcessing();
});