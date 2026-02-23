// Your COMPLETE refactored test code here

test('onprocessfileabort', done => {
    createPond();
    pond.onprocessfileabort = () => {
        done();
    };
    pond.files = [data];

    pond.getFile().abortProcessing();
})