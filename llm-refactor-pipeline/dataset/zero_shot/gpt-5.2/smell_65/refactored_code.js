test('process, then remove file object', async () => {
    const removed = new Promise((resolve, reject) => {
        pond.onremovefile = (error, file) => {
            try {
                expect(error).toBe(null);
                expect(pond.getFiles()).toHaveLength(0);
                resolve(file);
            } catch (e) {
                reject(e);
            }
        };
    });

    pond.onaddfile = () => {
        pond.processFile().then(() => {
            pond.removeFile();
        });
    };

    pond.files = [DUMMY_FILE];

    await removed;
});