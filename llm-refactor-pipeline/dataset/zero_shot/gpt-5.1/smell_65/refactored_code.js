test('process, then remove file object', async () => {
    const onRemoveFilePromise = new Promise((resolve, reject) => {
        pond.onremovefile = (error, file) => {
            try {
                expect(error).toBe(null);
                expect(pond.getFiles().length).toBe(0);
                resolve();
            } catch (assertionError) {
                reject(assertionError);
            }
        };
    });

    pond.onaddfile = () => {
        pond.processFile().then(() => {
            pond.removeFile();
        });
    };

    pond.files = [DUMMY_FILE];

    await onRemoveFilePromise;
});