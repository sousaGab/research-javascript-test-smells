test('revert limbo with serverId set', () => {
    const fileId = 'abcdefghijklmnop';
    pond = setupPond({ chunkUploads: false }, fileId, 'limbo');
    
    pond.onremovefile = (error, file) => {
        expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
        expect(error).toBeNull();
        expect(pond.getFiles()).toHaveLength(0);
    };
    
    pond.removeFile(item);
    expect(item.serverId).toBe(fileId);
});