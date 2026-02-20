test('onprocessfileabort should call callback when file processing is aborted', done => {
    createPond();
    const spy = jest.fn();
    pond.onprocessfileabort = spy;
    pond.files = [data];

    pond.getFile().abortProcessing();

    expect(spy).toHaveBeenCalled();
    done();
});