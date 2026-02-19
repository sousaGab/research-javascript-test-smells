test('onprocessfileabort', done => {
        createPond();
        pond.onprocessfileabort = () => {
            expect(pond.getFile().status).toBe(Status.ABORTED);
            done();
        };
        pond.files = [data];

        pond.getFile().abortProcessing();
    })