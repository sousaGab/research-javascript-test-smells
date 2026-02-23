test('revert limbo with serverId set', () => {
        const fileId = 'abcdefghijklmnop';
        pond = setupPond({ chunkUploads: false }, fileId, 'limbo');
        // Check that serverId is not null (anything accepts values that are not null or undefined)
        expect(item.serverId).not.toBeNull();
        expect(item.serverId).not.toBeUndefined();
        pond.onremovefile = (error, file) => {
            expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
            expect(error).toBeNull();
            expect(pond.getFiles().length).toBe(0);
            done();
        }
        pond.removeFile(item);
    })