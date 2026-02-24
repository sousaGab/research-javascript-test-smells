test('onprocessfileabort', () => {
    createPond();
    const abortHandler = jest.fn();
    pond.onprocessfileabort = abortHandler;
    pond.files = [data];

    const file = pond.getFile();
    file.abortProcessing();

    expect(abortHandler).toHaveBeenCalledTimes(1);
    expect(abortHandler).toHaveBeenCalledWith(file);
});