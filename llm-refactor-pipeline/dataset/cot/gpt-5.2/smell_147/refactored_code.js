// Your COMPLETE refactored test code here
test('remove file object from client and fail to remove from server', done => {
    pond.server = {
        ...server,
        remove: (source, load, error) => {
            // Fail asynchronously without relying on real time delays
            Promise.resolve().then(() => error('fail'));
        },
    };

    const onremovefile = jest.fn();
    pond.onremovefile = onremovefile;

    pond.onremovefile = (error, file) => {
        expect(error.type).toBe('error');
        expect(onremovefile).not.toHaveBeenCalled();
        expect(pond.getFiles().length).toBe(1);
        done();
    };

    pond.onaddfile = () => {
        pond.removeFile();
    };

    pond.files = [LOCAL_FILE];
});