test('remove file object from client and fail to remove from server', async () => {
    const mockError = jest.fn();
    
    pond.server = {
        ...server,
        remove: (source, load, error) => {
            error('fail');
        },
    };

    const onremovefile = jest.fn();
    pond.onremovefile = onremovefile;

    const removePromise = new Promise((resolve) => {
        pond.onremovefile = (error, file) => {
            expect(error.type).toBe('error');
            expect(onremovefile).not.toHaveBeenCalled();
            expect(pond.getFiles().length).toBe(1);
            resolve();
        };
    });

    pond.onaddfile = () => {
        pond.removeFile();
    };

    pond.files = [LOCAL_FILE];
    
    await removePromise;
});