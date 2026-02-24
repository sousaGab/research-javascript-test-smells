test('revert on removal of chunked upload with chunkForce set', async () => {
    pond = setupPond({ chunkUploads: true, chunkForce: true, chunkSize: 1024 }, TEXT_FILE_LARGE);

    await pond.removeFile(item);

    expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
    expect(pond.getFiles()).toHaveLength(0);
});