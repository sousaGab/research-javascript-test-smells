test('process, then remove file object', () => {
        const promise = new Promise((resolve) => {
            pond.onremovefile = (error, file) => {
                expect(error).toBe(null);
                expect(pond.getFiles().length).toBe(0);
                resolve();
            };
        });
        
        pond.onaddfile = () => {
            pond.processFile().then(() => {
                pond.removeFile();
            });
        };
        
        pond.files = [DUMMY_FILE];
        
        return promise;
    })