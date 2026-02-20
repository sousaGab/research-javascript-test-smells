test('processes file and removes it successfully', async () => {
    const pond = {
        files: [DUMMY_FILE],
        getFiles: () => [],
        onremovefile: null,
        onaddfile: null,
        processFile: () => Promise.resolve(),
        removeFile: () => {
            if (pond.onremovefile) {
                pond.onremovefile(null, DUMMY_FILE);
            }
        }
    };

    const promise = new Promise((resolve) => {
        pond.onremovefile = (error, file) => {
            expect(error).toBeNull();
            expect(pond.getFiles()).toHaveLength(0);
            resolve();
        };
    });

    pond.onaddfile = () => {
        pond.processFile().then(() => {
            pond.removeFile();
        });
    };

    pond.onaddfile();
    
    await promise;
});