test('remove file object from client and fail to remove from server', done => {
    let removeErrorCalled = false;
    
    pond.server = {
        ...server,
        remove: (source, load, error) => {
            // Call error immediately instead of using setTimeout
            error('fail');
            removeErrorCalled = true;
        },
    };

    const onremovefile = jest.fn();
    pond.onremovefile = onremovefile;

    pond.onremovefile = (error, file) => {
        expect(error.type).toBe('error');
        expect(onremovefile).not.toHaveBeenCalled();
        expect(pond.getFiles().length).toBe(1);
        expect(removeErrorCalled).toBe(true);
        done();
    };

    pond.onaddfile = () => {
        pond.removeFile();
    };

    pond.files = [LOCAL_FILE];
});