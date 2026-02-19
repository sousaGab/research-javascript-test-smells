test('process, then remove file object', done => {
        pond.onremovefile = (error, file) => {
            expect(error).toBeNull();
            expect(pond.getFiles()).toHaveLength(0);
            done();
        };
        pond.onaddfile = () => {
            pond.processFile().then(() => {
                pond.removeFile();
            });
        };
        pond.files = [DUMMY_FILE];
    })