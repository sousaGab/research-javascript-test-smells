test('process, then remove file object', async () => {
    const removeFilePromise = new Promise(resolve => {
        pond.onremovefile = resolve;
    });

    pond.onaddfile = async () => {
        await pond.processFile();
        pond.removeFile();
    };

    pond.files = [DUMMY_FILE];
    
    const result = await removeFilePromise;
    expect(result.error).toBe(null);
    expect(pond.getFiles().length).toBe(0);
});