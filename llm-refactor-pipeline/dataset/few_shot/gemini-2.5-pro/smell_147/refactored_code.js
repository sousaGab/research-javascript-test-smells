test('remove file object from client and fail to remove from server', done => {
    pond.server = {
        ...server,
        remove: (source, load, error) => {
            // Fail immediately without a timeout
            error('fail');
        },
    };

    pond.onremovefile = (error, file) => {
        expect(error.type).toBe('error');
        // File should not be removed on the client if the server call fails
        expect(pond.getFiles().length).toBe(1);
        done();
    };

    pond.onaddfile = () => {
        pond.removeFile();
    };

    pond.files = [LOCAL_FILE];
});