test('open() handles error event correctly', (done) => {
    const error = new Error('test');
    const writeStreamMock = jest.mocked(writeStream);
    const writeStreamInstanceMock = jest.mocked(writeStreamInstance);

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
  })