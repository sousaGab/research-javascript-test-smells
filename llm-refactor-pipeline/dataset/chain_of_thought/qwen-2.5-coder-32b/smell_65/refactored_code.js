test('process, then remove file object', done => {
    const mockFile = DUMMY_FILE;
    
    pond.onremovefile = (error, file) => {
        expect(error).toBeNull();
        expect(pond.getFiles()).toHaveLength(0);
        done();
    };
    
    pond.onaddfile = () => {
        pond.processFile()
            .then(() => pond.removeFile())
            .catch(done.fail);
    };
    
    pond.files = [mockFile];
});