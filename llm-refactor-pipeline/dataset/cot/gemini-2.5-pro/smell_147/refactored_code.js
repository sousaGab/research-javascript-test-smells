test('remove file object from client and fail to remove from server', () => {
    jest.useFakeTimers();

    pond.server = {
        ...server,
        remove: (source, load, error) => {
            setTimeout(() => {
                error('fail');
            }, 10);
        },
    };

    const onRemoveFileHandler = jest.fn();
    pond.onremovefile = onRemoveFileHandler;

    pond.onaddfile = () => {
        pond.removeFile();
    };

    // This assignment is expected to trigger the onaddfile -> removeFile flow
    pond.files = [LOCAL_FILE];

    // Fast-forward timers to execute the error callback in the mock server
    jest.runAllTimers();

    expect(onRemoveFileHandler).toHaveBeenCalledTimes(1);
    const [error] = onRemoveFileHandler.mock.calls[0];
    expect(error.type).toBe('error');
    expect(pond.getFiles().length).toBe(1);

    jest.useRealTimers();
});