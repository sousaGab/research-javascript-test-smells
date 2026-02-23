test('should call onprocessfileabort when aborting a file process', done => {
    const handleProcessFileAbort = jest.fn(() => {
        expect(handleProcessFileAbort).toHaveBeenCalledTimes(1);
        done();
    });

    createPond();
    pond.onprocessfileabort = handleProcessFileAbort;
    pond.files = [data];

    pond.getFile().abortProcessing();
});