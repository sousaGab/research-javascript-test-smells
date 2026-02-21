test('processes file and removes it successfully', async () => {
    const mockFile = DUMMY_FILE;
    
    const processPromise = new Promise(resolve => {
        pond.onaddfile = () => {
            pond.processFile().then(() => {
                pond.removeFile();
                resolve();
            });
        };
    });

    const removePromise = new Promise(resolve => {
        pond.onremovefile = (error, file) => {
            expect(error).toBeNull();
            expect(pond.getFiles().length).toBe(0);
            resolve();
        };
    });

    pond.files = [mockFile];
    
    await Promise.all([processPromise, removePromise]);
});