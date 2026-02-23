test('open() should propagate file error and set up write stream error handler', (done) => {
  const error = new Error('test');

  const onFileError = (err) => {
    expect(err).toBe(error);
    done();
  };

  file.on('error', onFileError);

  file.emit('error', error);

  expect(writeStreamMock).toBeCalled();
  expect(writeStreamInstanceMock.on).toBeCalledWith('error', expect.any(Function));
});