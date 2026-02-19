test('open() emits error event and sets up error handler', (done) => {
  const error = new Error('test');
  
  file.on('error', (err) => {
    expect(err).toBe(error);
    expect(writeStreamMock).toBeCalled();
    expect(writeStreamInstanceMock.on).toBeCalledWith(
      'error',
      expect.any(Function),
    );
    done();
  });

  file.emit('error', error);
});