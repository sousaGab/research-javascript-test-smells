test('revert on removal of chunked upload with chunkForce set', () => {
  const pond = setupPond({ chunkUploads: true, chunkForce: true, chunkSize: 1024 }, TEXT_FILE_LARGE);
  pond.onremovefile = (error, file) => {
    expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
    expect(error).toBe(null);
    expect(pond.getFiles().length).toBe(0);
    done();
  }
  pond.removeFile(item);
})