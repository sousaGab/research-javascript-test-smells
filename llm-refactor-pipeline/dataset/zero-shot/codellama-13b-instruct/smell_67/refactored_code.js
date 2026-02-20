test('revert limbo with serverId set', () => {
  const fileId = 'abcdefghijklmnop';
  pond = setupPond({ chunkUploads: false }, fileId, 'limbo');
  expect(item.serverId).toBe(fileId);
  pond.onremovefile = (error, file) => {
    expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
    expect(error).toBe(null);
    expect(pond.getFiles().length).toBe(0);
    done();
  }
  pond.removeFile(item);
})