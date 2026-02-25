test('remove file object from client and from server', async () => {
    const removalComplete = new Promise(resolve => {
        pond.onremovefile = (error, file) => {
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            resolve();
        };
    });

    pond.server = {
        ...server,
        remove: (source, load, error) => {
            // Call load callback immediately to simulate a successful server response
            load();
        },
    };

    pond.onaddfile = () => {
        pond.removeFile();
    };

    pond.files = [LOCAL_FILE];

    await removalComplete;
});