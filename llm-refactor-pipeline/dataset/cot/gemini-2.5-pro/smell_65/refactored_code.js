test('process, then remove file object', async () => {
    const removalComplete = new Promise(resolve => {
        pond.onremovefile = (error, file) => {
            resolve(error);
        };
    });

    pond.onaddfile = async () => {
        await pond.processFile();
        pond.removeFile();
    };

    pond.files = [DUMMY_FILE];

    const error = await removalComplete;

    expect(error).toBe(null);
    expect(pond.getFiles().length).toBe(0);
});