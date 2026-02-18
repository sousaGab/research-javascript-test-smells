test('revert limbo with serverId set', () => {
    const fileId = 'abcdefghijklmnop';
    pond = setupPond({ chunkUploads: false }, fileId, 'limbo');
    
    expect(item.serverId).toBe(fileId);
    
    const revertSpy = jest.fn();
    item.revert = revertSpy;
    
    pond.onremovefile = (error, file) => {
        expect(revertSpy).toHaveBeenCalledWith(expect.any(Function), false);
        expect(error).toBeNull();
        expect(pond.getFiles().length).toBe(0);
        done();
    };
    
    pond.removeFile(item);
});