test('revert on removal of chunked upload with chunkForce set', (done) => {
    expect.assertions(3);
    pond = setupPond({ chunkUploads: true, chunkForce: true, chunkSize: 1024 }, TEXT_FILE_LARGE);
    pond.onremovefile = (error, file) => {
        expect(error).toBe(null);
        expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
        expect(pond.getFiles().length).toBe(0);
        done();
    };
    pond.removeFile(item);
});