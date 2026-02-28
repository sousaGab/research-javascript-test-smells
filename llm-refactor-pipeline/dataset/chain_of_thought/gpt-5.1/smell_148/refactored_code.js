test('remove file object from client and from server', () => {
    jest.useFakeTimers();

    pond.server = {
        ...server,
        remove: (source, load, error) => {
            setTimeout(() => {
                load();
            }, 10);
        },
    };

    const onRemoveFilePromise = new Promise(resolve => {
        pond.onremovefile = (error, file) => {
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            resolve();
        };
    });

    pond.onaddfile = () => {
        pond.removeFile();
    };

    pond.files = [LOCAL_FILE];

    jest.runAllTimers();

    return onRemoveFilePromise;
});