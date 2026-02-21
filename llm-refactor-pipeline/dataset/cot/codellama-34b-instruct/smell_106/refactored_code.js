test('open()', () => {
    const error = new Error('test');
    const errorHandler = jest.fn();
    file.on('error', errorHandler);

    file.emit('error', error);

    expect(errorHandler).toBeCalledWith(error);
    expect(writeStreamMock).toBeCalled();
    expect(writeStreamInstanceMock.on).toBeCalledWith(
      'error',
      expect.any(Function),
    );
  })