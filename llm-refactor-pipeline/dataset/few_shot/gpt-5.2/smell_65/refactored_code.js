test('process, then remove file object', async () => {
    const removeFilePromise = new Promise((resolve, reject) => {
        pond.onremovefile = (error, file) => {
            try {
                expect(error).toBe(null);
                expect(pond.getFiles().length).toBe(0);
                resolve(file);
            } catch (e) {
                reject(e);
            }
        };
    });

    pond.files = [DUMMY_FILE];

    await new Promise((resolve, reject) => {
        pond.onaddfile = () => {
            pond.processFile()
                .then(() => {
                    pond.removeFile();
                    resolve();
                })
                .catch(reject);
        };
    });

    await removeFilePromise;
});