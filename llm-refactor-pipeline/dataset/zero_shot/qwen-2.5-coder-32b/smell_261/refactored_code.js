test('onprocessfileabort', done => {
        createPond();
        pond.onprocessfileabort = () => {
            expect(pond.getFile().status).toBe(4); // Assuming 4 represents aborted status
            done();
        };
        pond.files = [data];

        pond.getFile().abortProcessing();
    })