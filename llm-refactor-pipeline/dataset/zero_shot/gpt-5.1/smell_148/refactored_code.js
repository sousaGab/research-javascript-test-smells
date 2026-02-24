test('remove file object from client and from server', async () => {
    await new Promise(resolve => {
        pond.server = {
            ...server,
            remove: (source, load, error) => {
                // Simulate async server removal without relying on arbitrary timeouts
                Promise.resolve().then(() => {
                    load();
                });
            },
        };

        pond.onremovefile = (error, file) => {
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            resolve();
        };

        pond.onaddfile = () => {
            pond.removeFile();
        };

        pond.files = [LOCAL_FILE];
    });
})