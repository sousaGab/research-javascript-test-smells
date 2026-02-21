test('open() should handle error event correctly', (done) => {
    const error = new Error('test');
    const mockErrorCallback = jest.fn();
    
    file.on('error', mockErrorCallback);
    file.emit('error', error);

    expect(mockErrorCallback).toHaveBeenCalledWith(error);
    expect(writeStreamMock).toBeCalled();
    expect(writeStreamInstanceMock.on).toBeCalledWith(
      'error',
      expect.any(Function),
    );
    done();
});