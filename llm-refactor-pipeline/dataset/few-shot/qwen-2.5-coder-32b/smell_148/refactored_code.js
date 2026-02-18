test('remove file object from client and from server', done => {
        const removePromise = new Promise(resolve => {
            pond.server = {
                ...server,
                remove: (source, load, error) => {
                    resolve();
                    load();
                },
            };
        });

        pond.onremovefile = (error, file) => {
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            done();
        };

        pond.onaddfile = async () => {
            await removePromise;
            pond.removeFile();
        };

        pond.files = [LOCAL_FILE];
    })