test('process, then remove file object', async () => {
    const onRemoveFile = jest.fn();

    pond.onremovefile = (error, file) => {
        onRemoveFile(error, file);
    };

    pond.onaddfile = () => {
        pond.processFile().then(() => {
            pond.removeFile();
        });
    };

    pond.files = [DUMMY_FILE];

    await new Promise(resolve => {
        const originalOnRemoveFile = pond.onremovefile;
        pond.onremovefile = (error, file) => {
            originalOnRemoveFile(error, file);
            resolve();
        };
    });

    expect(onRemoveFile).toHaveBeenCalledTimes(1);
    const [error] = onRemoveFile.mock.calls[0];
    expect(error).toBe(null);
    expect(pond.getFiles().length).toBe(0);
});