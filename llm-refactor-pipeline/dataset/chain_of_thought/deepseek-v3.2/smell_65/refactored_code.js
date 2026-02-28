test('process, then remove file object', async () => {
    const removeFilePromise = new Promise(resolve => {
        pond.onremovefile = (error, file) => {
            resolve({ error, file });
        };
    });

    const addFilePromise = new Promise(resolve => {
        pond.onaddfile = resolve;
    });

    pond.files = [DUMMY_FILE];
    await addFilePromise;

    await pond.processFile();
    pond.removeFile();

    const result = await removeFilePromise;
    expect(result.error).toBe(null);
    expect(pond.getFiles().length).toBe(0);
});