test('process, then remove file object', async () => {
    // Set up the test environment
    const pond = new Pond();
    const DUMMY_FILE = new File([''], 'dummy.txt');

    // Add the file to the pond
    await pond.onaddfile(DUMMY_FILE);

    // Process the file
    await pond.processFile();

    // Remove the file from the pond
    await pond.removeFile();

    // Verify that the file was removed
    expect(pond.getFiles().length).toBe(0);
});