test('remove file object from client and fail to remove from server', () => {
    // Mock the setTimeout function to make it synchronous
    jest.spyOn(window, 'setTimeout').mockImplementation((fn) => {
        fn();
    });

    const pond = new Pond();
    pond.server = {
        ...server,
        remove: (source, load, error) => {
            error('fail');
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

    // Clean up the mock
    jest.restoreAllMocks();
});