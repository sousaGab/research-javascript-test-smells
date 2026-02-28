test('open() should emit and handle error event correctly', (done) => {
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