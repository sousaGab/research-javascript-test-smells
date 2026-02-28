test('onprocessfileabort triggers abort handler when file processing is aborted', done => {
    createPond();
    expect.assertions(1);

    pond.onprocessfileabort = file => {
        expect(file.status).toBe('aborted');
        done();
    };

    pond.files = [data];

    const file = pond.getFile();
    file.abortProcessing();
});