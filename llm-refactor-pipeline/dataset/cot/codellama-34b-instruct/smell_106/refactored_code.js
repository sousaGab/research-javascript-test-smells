// Your COMPLETE refactored test code here

test('open()', () => {
    const error = new Error('test');
    file.on('error', (err) => {
      expect(err).toBe(error);
    });

    file.emit('error', error);

    expect(writeStreamMock).toBeCalled();
    expect(writeStreamInstanceMock.on).toBeCalledWith(
      'error',
      expect.any(Function),
    );
  })