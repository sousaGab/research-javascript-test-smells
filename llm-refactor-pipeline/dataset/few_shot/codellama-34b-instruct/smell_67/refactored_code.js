test('revert limbo with serverId set', () => {
    const fileId = 'abcdefghijklmnop';
    const pond = setupPond({ chunkUploads: false }, fileId, 'limbo');
    const item = pond.getFiles()[0];

    // Check that serverId is not null (anything accepts values that are not null or undefined)
    expect(item.serverId).toBe(fileId);

    // Check that the file was removed
    expect(pond.getFiles().length).toBe(0);

    // Check that the revert method was called with the correct arguments
    expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);

    // Check that the error argument is null
    expect(error).toBe(null);

    done();
})