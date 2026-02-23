test('revert on removal of chunked upload with chunkForce set', () => {
    const pond = setupPond({ chunkUploads: true, chunkForce: true, chunkSize: 1024 }, TEXT_FILE_LARGE);
    const item = pond.getFiles()[0];
    pond.removeFile(item);
    expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
    expect(pond.getFiles().length).toBe(0);
});