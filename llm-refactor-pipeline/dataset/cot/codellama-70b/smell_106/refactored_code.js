test('open()', (done) => {
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