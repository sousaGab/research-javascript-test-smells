test('revert limbo with serverId set', async () => {
    const fileId = 'abcdefghijklmnop';
    pond = setupPond({ chunkUploads: false }, fileId, 'limbo');

    expect(item.serverId).toBe(fileId);

    const removalComplete = new Promise(resolve => {
        pond.onremovefile = (error, file) => {
            resolve(error);
        };
    });

    pond.removeFile(item);

    const error = await removalComplete;

    expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
    expect(error).toBeNull();
    expect(pond.getFiles()).toHaveLength(0);
});