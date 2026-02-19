test('remove file object from client and fail to remove from server', done => {
        const removePromise = new Promise((resolve) => {
            pond.server = {
                ...server,
                remove: (source, load, error) => {
                    resolve();
                    error('fail');
                },
            };
        });

        const onremovefile = jest.fn();
        pond.onremovefile = onremovefile;

        pond.onremovefile = (error, file) => {
            expect(error.type).toBe('error');
            expect(onremovefile).not.toHaveBeenCalled();
            expect(pond.getFiles().length).toBe(1);
            done();
        };

        pond.onaddfile = async () => {
            await removePromise;
            pond.removeFile();
        };

        pond.files = [LOCAL_FILE];
    })