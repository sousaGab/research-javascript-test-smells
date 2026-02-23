test('onprocessfileabort', done => {
        createPond();
        let abortCalled = false;
        pond.onprocessfileabort = () => {
            abortCalled = true;
            expect(abortCalled).toBe(true);
            expect(pond.getFile()).toBeDefined();
            done();
        };
        pond.files = [data];

        pond.getFile().abortProcessing();
    })