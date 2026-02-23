test('remove file object from client and fail to remove from server', async () => {
    // Create a promise that resolves when the 'onremovefile' event occurs
    const removal = new Promise(resolve => {
        pond.onremovefile = (error, file) => {
            // Resolve the promise with the arguments from the event
            resolve({ error, file });
        };
    });

    // Mock the server to simulate an immediate failure.
    // The artificial delay is not needed as the component's event-driven
    // nature is what makes the process asynchronous.
    pond.server = {
        ...server,
        remove: (source, load, error) => {
            error('fail');
        },
    };

    // Set up the trigger: when a file is added, immediately try to remove it.
    pond.onaddfile = () => {
        pond.removeFile();
    };

    // Trigger the 'addfile' event, which starts the removal process
    pond.files = [LOCAL_FILE];

    // Wait for the 'onremovefile' event to fire
    const { error } = await removal;

    // Assert the outcome
    expect(error.type).toBe('error');
    expect(pond.getFiles().length).toBe(1);
});