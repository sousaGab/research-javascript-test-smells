test('remove file object from client and from server', async () => {
    const mockRemove = jest.fn((source, load, error) => {
        load();
    });

    pond.server = {
        ...server,
        remove: mockRemove,
    };

    const removePromise = new Promise(resolve => {
        pond.onremovefile = (error, file) => {
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            resolve();
        };
    });

    pond.onaddfile = () => {
        pond.removeFile();
    };

    pond.files = [LOCAL_FILE];

    await removePromise;
});