test('remove file object from client and from server', async () => {
    pond.server = {
        ...server,
        remove: (source, load, error) => {
            load();
        },
    };

    const removalComplete = new Promise(resolve => {
        pond.onremovefile = (error, file) => {
            expect(error).toBe(null);
            resolve();
        };
    });

    pond.onaddfile = () => {
        pond.removeFile();
    };

    pond.files = [LOCAL_FILE];

    await removalComplete;

    expect(pond.getFiles().length).toBe(0);
});