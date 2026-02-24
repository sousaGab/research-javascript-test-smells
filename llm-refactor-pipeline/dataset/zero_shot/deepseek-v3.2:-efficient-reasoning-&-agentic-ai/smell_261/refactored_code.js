test('onprocessfileabort', done => {
    createPond();
    let callbackCalled = false;
    
    pond.onprocessfileabort = () => {
        callbackCalled = true;
        done();
    };
    
    pond.files = [data];
    pond.getFile().abortProcessing();
    
    setTimeout(() => {
        expect(callbackCalled).toBe(true);
    }, 0);
})