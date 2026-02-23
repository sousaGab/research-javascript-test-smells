test('open() should emit error when write stream encounters an error', (done) => {
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