test('onprocessfileabort', done => {
        createPond();
        pond.onprocessfileabort = (file) => {
            expect(file).toBeDefined();
            done();
        };
        pond.files = [data];

        pond.getFile().abortProcessing();
    })