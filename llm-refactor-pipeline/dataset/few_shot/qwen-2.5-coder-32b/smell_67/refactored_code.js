test('revert limbo with serverId set', () => {
    const fileId = 'abcdefghijklmnop';
    pond = setupPond({ chunkUploads: false }, fileId, 'limbo');
    
    // Verify serverId is set correctly
    expect(pond.getFiles()[0].serverId).toBe(fileId);
    
    pond.onremovefile = (error, file) => {
        expect(pond.getFiles().length).toBe(0);
        expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
        expect(error).toBeNull();
        done();
    };
    
    pond.removeFile(item);
});