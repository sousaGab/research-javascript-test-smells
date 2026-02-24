test('remove file object from client and from server', done => {
    let removeCallback;
    
    pond.server = {
        ...server,
        remove: (source, load, error) => {
            removeCallback = load;
        },
    };

    pond.onremovefile = (error, file) => {
        expect(error).toBe(null);
        expect(pond.getFiles().length).toBe(0);
        done();
    };

    pond.onaddfile = () => {
        pond.removeFile();
        if (removeCallback) {
            removeCallback();
        }
    };

    pond.files = [LOCAL_FILE];
});