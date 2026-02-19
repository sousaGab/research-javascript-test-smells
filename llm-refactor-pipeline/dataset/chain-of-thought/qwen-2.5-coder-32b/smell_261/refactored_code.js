test('onprocessfileabort should call callback when file processing is aborted', done => {
    createPond();
    const mockCallback = jest.fn();
    pond.onprocessfileabort = mockCallback;
    pond.files = [data];

    pond.getFile().abortProcessing();

    // Verify the callback was called
    expect(mockCallback).toHaveBeenCalled();
    done();
});