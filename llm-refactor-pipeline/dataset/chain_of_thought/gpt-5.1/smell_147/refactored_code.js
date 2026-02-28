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

    const onremovefile = jest.fn();
    pond.onremovefile = onremovefile;

    const onRemoveFileHandler = jest.fn((error, file) => {
        expect(error.type).toBe('error');
        expect(onremovefile).not.toHaveBeenCalled();
        expect(pond.getFiles().length).toBe(1);
    });

    pond.onremovefile = onRemoveFileHandler;

    pond.onaddfile = () => {
        pond.removeFile();
    };

    pond.files = [LOCAL_FILE];

    jest.runAllTimers();

    expect(onRemoveFileHandler).toHaveBeenCalled();
});