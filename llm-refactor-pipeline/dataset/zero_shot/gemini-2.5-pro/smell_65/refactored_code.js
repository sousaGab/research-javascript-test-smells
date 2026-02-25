test('process, then remove file object', async () => {
    const removalPromise = new Promise(resolve => {
        pond.onremovefile = (error, file) => {
            // Resolve with the error so we can assert it later
            resolve(error);
        };
    });

    pond.onaddfile = () => {
        pond.processFile().then(() => {
            pond.removeFile();
        });
    };

    // Trigger the add/process/remove chain
    pond.files = [DUMMY_FILE];

    // Wait for the remove event to fire
    const error = await removalPromise;

    // Assert that no error occurred
    expect(error).toBeNull();

    // Assert that the file list is empty
    expect(pond.getFiles().length).toBe(0);
});