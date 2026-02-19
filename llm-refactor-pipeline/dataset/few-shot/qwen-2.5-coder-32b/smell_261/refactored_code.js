test('onprocessfileabort calls done when file processing is aborted', done => {
        createPond();
        const mockDone = jest.fn(done);
        pond.onprocessfileabort = () => {
            mockDone();
        };
        pond.files = [data];
        pond.getFile().abortProcessing();
        
        // Verify that done was called
        expect(mockDone).toHaveBeenCalled();
    })