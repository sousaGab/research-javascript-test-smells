// Your COMPLETE refactored test code here

test('revert on removal of chunked upload with chunkForce set', () => {
    const pond = setupPond({ chunkUploads: true, chunkForce: true, chunkSize: 1024 }, TEXT_FILE_LARGE);
    const item = pond.getFiles()[0];
    const revertSpy = jest.spyOn(item, 'revert');
    const removeFileSpy = jest.spyOn(pond, 'removeFile');

    pond.onremovefile = (error, file) => {
        expect(revertSpy).toHaveBeenCalledWith(expect.any(Function), false);
        expect(error).toBe(null);
        expect(pond.getFiles().length).toBe(0);
        done();
    }

    removeFileSpy(item);

    expect(revertSpy).toHaveBeenCalled();
    expect(removeFileSpy).toHaveBeenCalledWith(item);
});