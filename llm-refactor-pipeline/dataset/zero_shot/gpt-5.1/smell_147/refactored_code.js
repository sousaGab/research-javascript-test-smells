test('remove file object from client and fail to remove from server', async () => {
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

    const onRemoveFilePromise = new Promise(resolve => {
        pond.onremovefile = (error, file) => {
            try {
                expect(error.type).toBe('error');
                expect(onremovefile).not.toHaveBeenCalled();
                expect(pond.getFiles().length).toBe(1);
                resolve();
            } catch (e) {
                resolve(Promise.reject(e));
            }
        };
    });

    pond.onaddfile = () => {
        pond.removeFile();
    };

    pond.files = [LOCAL_FILE];

    jest.runAllTimers();
    await onRemoveFilePromise;

    jest.useRealTimers();
});