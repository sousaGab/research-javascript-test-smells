// Your COMPLETE refactored test code here
test('process, then remove file object', done => {
    pond.onaddfile = () => {
        pond.processFile().then(() => {
            pond.removeFile();
        });
    };
    pond.onremovefile = (error, file) => {
        expect(error).toBe(null);
        expect(pond.getFiles().length).toBe(0);
        done();
    };
    pond.files = [DUMMY_FILE];
})