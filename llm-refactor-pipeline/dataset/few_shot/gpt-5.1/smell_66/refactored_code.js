test('revert on removal of chunked upload with chunkForce set', (done) => {
    pond = setupPond({ chunkUploads: true, chunkForce: true, chunkSize: 1024 }, TEXT_FILE_LARGE);

    pond.onremovefile = (error, file) => {
        expect(error).toBeNull();
        expect(pond.getFiles()).toHaveLength(0);
        expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
        done();
    };

    pond.removeFile(item);
});