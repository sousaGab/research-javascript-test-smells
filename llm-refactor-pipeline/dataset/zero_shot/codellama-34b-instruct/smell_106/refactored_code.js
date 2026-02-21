test('open() should emit an error event when the file is not found', (done) => {
    const fileNotFoundError = new Error('File not found');
    file.on('error', (err) => {
      expect(err).toBe(fileNotFoundError);
      done();
    });

    file.emit('error', fileNotFoundError);

    expect(writeStreamMock).toBeCalled();
    expect(writeStreamInstanceMock.on).toBeCalledWith(
      'error',
      expect.any(Function),
    );
  })