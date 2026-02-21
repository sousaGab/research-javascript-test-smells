test('remove file object from client and fail to remove from server', async () => {
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

    await pond.removeFile();

    expect(onremovefile).not.toHaveBeenCalled();
    expect(pond.getFiles().length).toBe(1);
});