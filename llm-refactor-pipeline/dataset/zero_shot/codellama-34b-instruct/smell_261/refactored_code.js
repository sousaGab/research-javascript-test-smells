test('onprocessfileabort', done => {
    createPond();
    pond.onprocessfileabort = () => {
        done();
    };
    pond.files = [data];

    pond.getFile().abortProcessing();

    // Add an assertion to check that the onprocessfileabort event is being triggered
    expect(pond.onprocessfileabort).toHaveBeenCalled();
})