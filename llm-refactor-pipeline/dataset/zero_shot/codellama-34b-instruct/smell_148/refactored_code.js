test('remove file object from client and from server', async () => {
    pond.server = {
        ...server,
        remove: (source, load, error) => {
            load();
        },
    };

    pond.onremovefile = (error, file) => {
        expect(error).toBe(null);
        expect(pond.getFiles().length).toBe(0);
    };

    pond.onaddfile = () => {
        pond.removeFile();
    };

    pond.files = [LOCAL_FILE];

    await pond.onremovefile;
});