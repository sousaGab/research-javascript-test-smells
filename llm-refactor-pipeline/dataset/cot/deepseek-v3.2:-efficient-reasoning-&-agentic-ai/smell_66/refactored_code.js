test('revert on removal of chunked upload with chunkForce set', async () => {
    pond = setupPond({ chunkUploads: true, chunkForce: true, chunkSize: 1024 }, TEXT_FILE_LARGE);
    
    const removePromise = new Promise((resolve) => {
        pond.onremovefile = (error, file) => {
            resolve({ error, file });
        };
    });
    
    pond.removeFile(item);
    const { error, file } = await removePromise;
    
    expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
    expect(error).toBe(null);
    expect(pond.getFiles().length).toBe(0);
});