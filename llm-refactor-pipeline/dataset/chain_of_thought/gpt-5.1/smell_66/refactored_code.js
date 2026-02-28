test('revert on removal of chunked upload with chunkForce set', () => {
    return new Promise((resolve) => {
        pond = setupPond(
            { chunkUploads: true, chunkForce: true, chunkSize: 1024 },
            TEXT_FILE_LARGE
        );

        pond.onremovefile = (error, file) => {
            expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
            expect(error).toBeNull();
            expect(pond.getFiles()).toHaveLength(0);
            resolve();
        };

        pond.removeFile(item);
    });
})