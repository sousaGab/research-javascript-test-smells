test('remove file object from client and from server', done => {
    let loadCallback;
    
    pond.server = {
        ...server,
        remove: (source, load, error) => {
            loadCallback = load;
        },
    };

    pond.onremovefile = (error, file) => {
        expect(error).toBe(null);
        expect(pond.getFiles().length).toBe(0);
        done();
    };

    pond.onaddfile = () => {
        pond.removeFile();
        if (loadCallback) {
            loadCallback();
        }
    };

    pond.files = [LOCAL_FILE];
});