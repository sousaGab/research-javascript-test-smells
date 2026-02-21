test('onprocessfileabort should be called when file processing is aborted', done => {
    const mockDone = jest.fn(() => done());
    
    createPond();
    pond.onprocessfileabort = mockDone;
    pond.files = [data];

    pond.getFile().abortProcessing();
    
    // Verify that the callback was called
    expect(mockDone).toHaveBeenCalled();
});