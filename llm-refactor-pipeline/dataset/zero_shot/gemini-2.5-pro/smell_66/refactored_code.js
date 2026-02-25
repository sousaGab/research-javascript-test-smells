test('revert on removal of chunked upload with chunkForce set', async () => {
    // Arrange
    pond = setupPond({ chunkUploads: true, chunkForce: true, chunkSize: 1024 }, TEXT_FILE_LARGE);

    const removalPromise = new Promise(resolve => {
        pond.onremovefile = (error, file) => resolve({ error, file });
    });

    // Act
    pond.removeFile(item);

    // Assert
    const { error } = await removalPromise;

    expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
    expect(error).toBe(null);
    expect(pond.getFiles()).toHaveLength(0);
});