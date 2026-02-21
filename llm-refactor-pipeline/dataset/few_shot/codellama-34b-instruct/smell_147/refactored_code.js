test('remove file object from client and fail to remove from server', async () => {
        pond.server = {
            ...server,
            remove: (source, load, error) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject('fail');
                    }, 10);
                });
            },
        };

        const onremovefile = jest.fn();
        pond.onremovefile = onremovefile;

        await pond.onremovefile(LOCAL_FILE);

        expect(onremovefile).not.toHaveBeenCalled();
        expect(pond.getFiles().length).toBe(1);
    })