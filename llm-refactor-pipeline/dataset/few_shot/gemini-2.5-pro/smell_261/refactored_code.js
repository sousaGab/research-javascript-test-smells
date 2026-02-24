test('onprocessfileabort', () => {
    const handleProcessFileAbort = jest.fn();
    createPond();
    pond.onprocessfileabort = handleProcessFileAbort;
    pond.files = [data];

    pond.getFile().abortProcessing();

    expect(handleProcessFileAbort).toHaveBeenCalledTimes(1);
})