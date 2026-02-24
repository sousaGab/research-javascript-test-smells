test('process, then remove file object', async () => {
    // Arrange: Create a promise that resolves when the file is removed,
    // capturing the error object from the event callback.
    const fileRemoved = new Promise(resolve => {
        pond.onremovefile = (error, file) => resolve(error);
    });

    // Create a promise that resolves when the file is added.
    const fileAdded = new Promise(resolve => {
        pond.onaddfile = () => resolve();
    });

    // Act: Trigger the sequence of operations, awaiting each step.
    pond.files = [DUMMY_FILE];
    await fileAdded;

    await pond.processFile();

    pond.removeFile();
    const removalError = await fileRemoved;

    // Assert
    expect(removalError).toBe(null);
    expect(pond.getFiles().length).toBe(0);
});