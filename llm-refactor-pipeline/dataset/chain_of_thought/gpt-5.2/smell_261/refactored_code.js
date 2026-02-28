test('onprocessfileabort', done => {
    createPond();

    expect(pond).toBeDefined();

    const handler = jest.fn(() => {
        expect(handler).toHaveBeenCalledTimes(1);
        done();
    });

    pond.onprocessfileabort = handler;
    pond.files = [data];

    pond.getFile().abortProcessing();
});