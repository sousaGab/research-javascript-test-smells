test('onprocessfileabort', done => {
    createPond();
    pond.onprocessfileabort = () => {
        done();
    };
    pond.files = [data];

    pond.getFile().abortProcessing();
    expect(pond.getFile().abortProcessing()).toBe(true);
})