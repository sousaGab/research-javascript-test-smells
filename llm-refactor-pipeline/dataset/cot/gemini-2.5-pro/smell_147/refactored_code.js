test('remove file object from client and fail to remove from server', done => {
    pond.server = {
        ...server,
        remove: (source, load, error) => {
            // The error callback is now invoked synchronously, removing the delay
            error('fail');
        },
    };

    pond.onremovefile = (error, file) => {
        expect(error.type).toBe('error');
        // The file should not be removed on the client if the server fails
        expect(pond.getFiles().length).toBe(1);
        done();
    };

    pond.onaddfile = () => {
        pond.removeFile();
    };

    // This assignment kicks off the test flow
    pond.files = [LOCAL_FILE];
});