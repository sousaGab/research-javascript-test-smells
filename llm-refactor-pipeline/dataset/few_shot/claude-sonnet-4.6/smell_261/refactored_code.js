test('onprocessfileabort', done => {
        createPond();
        pond.onprocessfileabort = () => {
            expect(pond.getFile().status).toBe('aborted');
            done();
        };
        pond.files = [data];

        pond.getFile().abortProcessing();
    })