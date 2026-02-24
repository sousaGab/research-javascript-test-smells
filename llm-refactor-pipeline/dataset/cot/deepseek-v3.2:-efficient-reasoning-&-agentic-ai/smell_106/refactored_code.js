test('open() should handle error events correctly', () => {
  const error = new Error('test');
  const errorHandler = jest.fn();
  
  file.on('error', errorHandler);
  file.emit('error', error);

  expect(errorHandler).toHaveBeenCalledWith(error);
  expect(writeStreamMock).toBeCalled();
  expect(writeStreamInstanceMock.on).toBeCalledWith(
    'error',
    expect.any(Function),
  );
});