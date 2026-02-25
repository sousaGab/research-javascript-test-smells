test('onprocessfileabort', done => {
        expect.assertions(1);

        createPond();
        pond.onprocessfileabort = (abortedFile) => {
            // Verify that the event is called with the correct file object
            expect(abortedFile.id).toBe(pond.getFile().id);
            done();
        };
        pond.files = [data];

        pond.getFile().abortProcessing();
    })