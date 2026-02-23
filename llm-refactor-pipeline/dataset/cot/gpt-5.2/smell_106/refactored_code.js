test('open() emits error and forwards it to the registered error handler', (done) => {
  const expectedError = new Error('test');

  const onFileError = (actualError) => {
    expect(actualError).toBe(expectedError);
    done();
  };

  file.on('error', onFileError);

  file.emit('error', expectedError);

  expect(writeStreamMock).toBeCalled();
  expect(writeStreamInstanceMock.on).toBeCalledWith('error', expect.any(Function));
});