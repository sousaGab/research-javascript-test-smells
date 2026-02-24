test('open() should emit error and call write stream with error handler', (done) => {
  const error = new Error('test');

  function handleFileError(err) {
    expect(err).toBe(error);
    done();
  }

  file.on('error', handleFileError);

  file.emit('error', error);

  expect(writeStreamMock).toBeCalled();
  expect(writeStreamInstanceMock.on).toBeCalledWith(
    'error',
    expect.any(Function),
  );
});