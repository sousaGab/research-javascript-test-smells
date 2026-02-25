test('remove file object from client and from server', done => {
    jest.useFakeTimers();

    pond.server = {
        ...server,
        remove: (source, load, error) => {
            setTimeout(() => {
                load();
            }, 10);
        },
    };

    pond.onremovefile = (error, file) => {
        expect(error).toBe(null);
        expect(pond.getFiles().length).toBe(0);
        done();
    };

    pond.onaddfile = () => {
        pond.removeFile();
        jest.runAllTimers();
    };

    pond.files = [LOCAL_FILE];
});