test('remove file object from client and from server', done => {
        pond.server = {
            ...server,
            remove: (source, load, error) => {
                // Simulate immediate successful server response
                load();
            },
        };

        pond.onremovefile = (error, file) => {
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            done();
        };

        pond.onaddfile = () => {
            pond.removeFile();
        };

        pond.files = [LOCAL_FILE];
    })