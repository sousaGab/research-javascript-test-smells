test('onprocessfileabort', () => {
        createPond();
        const handleProcessFileAbort = jest.fn();
        pond.onprocessfileabort = handleProcessFileAbort;
        pond.files = [data];

        pond.getFile().abortProcessing();

        expect(handleProcessFileAbort).toHaveBeenCalledTimes(1);
    })