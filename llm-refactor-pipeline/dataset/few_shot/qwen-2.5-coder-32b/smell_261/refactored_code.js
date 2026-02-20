test('onprocessfileabort calls done when file processing is aborted', done => {
        createPond();
        pond.onprocessfileabort = () => {
            expect(pond.files[0].status).toBe(FileStatus.ABORTED);
            done();
        };
        pond.files = [data];

        pond.getFile().abortProcessing();
    })