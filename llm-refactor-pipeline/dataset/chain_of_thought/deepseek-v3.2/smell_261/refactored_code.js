test('onprocessfileabort', done => {
    createPond();
    let abortCallbackCalled = false;
    pond.onprocessfileabort = () => {
        abortCallbackCalled = true;
        done();
    };
    pond.files = [data];

    pond.getFile().abortProcessing();
    
    expect(abortCallbackCalled).toBe(true);
})