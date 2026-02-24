test('process, then remove file object', async () => {
    const removalComplete = new Promise(resolve => {
        pond.onremovefile = (error, file) => {
            expect(error).toBeNull();
            resolve();
        };
    });

    pond.onaddfile = async () => {
        await pond.processFile();
        pond.removeFile();
    };

    pond.files = [DUMMY_FILE];

    await removalComplete;

    expect(pond.getFiles()).toHaveLength(0);
});