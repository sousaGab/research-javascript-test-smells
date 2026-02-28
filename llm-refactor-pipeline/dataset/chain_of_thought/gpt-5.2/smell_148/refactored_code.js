// Your COMPLETE refactored test code here
test('remove file object from client and from server', done => {
    jest.useFakeTimers();

    pond.server = {
        ...server,
        remove: (source, load, error) => {
            setTimeout(load, 10);
        },
    };

    pond.onremovefile = (error, file) => {
        try {
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            done();
        } catch (e) {
            done(e);
        } finally {
            jest.useRealTimers();
        }
    };

    pond.onaddfile = () => {
        pond.removeFile();
        jest.runOnlyPendingTimers();
    };

    pond.files = [LOCAL_FILE];
});