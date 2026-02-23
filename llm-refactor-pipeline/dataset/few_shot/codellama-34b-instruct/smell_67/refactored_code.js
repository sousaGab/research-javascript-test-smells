// Your COMPLETE refactored test code here

test('revert limbo with serverId set', () => {
    const fileId = 'abcdefghijklmnop';
    const pond = setupPond({ chunkUploads: false }, fileId, 'limbo');
    const item = pond.getFiles()[0];

    // Check that serverId is not null (anything accepts values that are not null or undefined)
    expect(item.serverId).toBe(fileId);

    pond.onremovefile = (error, file) => {
        expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
        expect(error).toBe(null);
        expect(pond.getFiles().length).toBe(0);
        done();
    }

    pond.removeFile(item);
});