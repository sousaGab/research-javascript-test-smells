test('open()', () => {
  const error = new Error('test');
  const file = new File();
  const writeStreamMock = jest.fn();
  const writeStreamInstanceMock = { on: jest.fn() };

  file.on('error', (err) => {
    expect(err).toBe(error);
  });

  file.emit('error', error);

  expect(writeStreamMock).toBeCalled();
  expect(writeStreamInstanceMock.on).toBeCalledWith(
    'error',
    expect.any(Function),
  );
});