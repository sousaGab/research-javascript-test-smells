test('should create a write stream on open and propagate stream errors', (done) => {
    const error = new Error('test');
    file.on('error', (err) => {
      expect(err).toBe(error);
      done();
    });

    file.emit('error', error);

    expect(writeStreamMock).toBeCalled();
    expect(writeStreamInstanceMock.on).toBeCalledWith(
      'error',
      expect.any(Function),
    );
  })