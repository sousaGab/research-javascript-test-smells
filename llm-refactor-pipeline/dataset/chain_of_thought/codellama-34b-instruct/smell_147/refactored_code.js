// Your COMPLETE refactored test code here

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

    pond.onremovefile = (error, file) => {
        expect(error.type).toBe('error');
        expect(onremovefile).not.toHaveBeenCalled();
        expect(pond.getFiles().length).toBe(1);
    };

    pond.onaddfile = () => {
        pond.removeFile();
    };

    pond.files = [LOCAL_FILE];
})