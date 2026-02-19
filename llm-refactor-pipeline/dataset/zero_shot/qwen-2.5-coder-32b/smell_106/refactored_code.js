test('open()', (done) => {
    const error = new Error('test');
    const errorHandler = (err) => {
      expect(err).toBe(error);
      done();
    };

    file.on('error', errorHandler);

    file.emit('error', error);

    expect(writeStreamMock).toBeCalled();
    expect(writeStreamInstanceMock.on).toBeCalledWith(
      'error',
      expect.any(Function),
    );
  })