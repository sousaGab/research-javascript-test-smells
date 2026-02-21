test('onprocessfileabort', done => {
    createPond();
    pond.onprocessfileabort = () => {
        expect(pond.getFile().isProcessing()).toBe(false);
        done();
    };
    pond.files = [data];

    pond.getFile().abortProcessing();
})