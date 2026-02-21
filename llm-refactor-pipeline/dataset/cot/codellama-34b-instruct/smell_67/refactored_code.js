test('revert limbo with serverId set', () => {
    const fileId = 'abcdefghijklmnop';
    const pond = setupPond({ chunkUploads: false }, fileId, 'limbo');
    const item = pond.getFiles()[0];

    // Check that serverId is not null (anything accepts values that are not null or undefined)
    expect(item.serverId).toBe(fileId);

    // Use a spy to verify that revert is called with the expected arguments
    const revertSpy = jest.spyOn(item, 'revert');
    pond.removeFile(item);
    expect(revertSpy).toHaveBeenCalledWith(expect.any(Function), false);

    // Verify that the file was removed from the pond
    expect(pond.getFiles().length).toBe(0);
})