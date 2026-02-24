test('onprocessfileabort', done => {
    createPond();
    let abortCalled = false;
    pond.onprocessfileabort = () => {
        abortCalled = true;
        done();
    };
    pond.files = [data];

    pond.getFile().abortProcessing();
    
    expect(abortCalled).toBe(true);
})