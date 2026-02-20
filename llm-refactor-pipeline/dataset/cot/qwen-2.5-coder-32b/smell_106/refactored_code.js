test('open() handles error event and sets up error listener', () => {
  const error = new Error('test');
  const mockDone = jest.fn();

  file.on('error', (err) => {
    expect(err).toBe(error);
    mockDone();
  });

  file.emit('error', error);

  expect(writeStreamMock).toBeCalled();
  expect(writeStreamInstanceMock.on).toBeCalledWith(
    'error',
    expect.any(Function),
  );
  expect(mockDone).toBeCalled();
});