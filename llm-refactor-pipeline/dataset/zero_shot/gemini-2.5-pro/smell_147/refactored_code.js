test('remove file object from client and fail to remove from server', done => {
    pond.server = {
        ...server,
        remove: (source, load, error) => {
            // Fail synchronously without a timeout
            error('fail');
        },
    };

    pond.onremovefile = (error, file) => {
        expect(error.type).toBe('error');
        // The file should not be removed from the pond instance on server error
        expect(pond.getFiles().length).toBe(1);
        done();
    };

    pond.onaddfile = () => {
        pond.removeFile();
    };

    pond.files = [LOCAL_FILE];
});