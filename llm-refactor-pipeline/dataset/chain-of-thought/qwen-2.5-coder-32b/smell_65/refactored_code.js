test('processes file and removes it successfully', () => {
    const mockFile = DUMMY_FILE;
    
    return new Promise(resolve => {
        pond.onremovefile = (error, file) => {
            expect(error).toBeNull();
            expect(pond.getFiles()).toHaveLength(0);
            resolve();
        };
        
        pond.onaddfile = () => {
            pond.processFile().then(() => {
                pond.removeFile();
            });
        };
        
        pond.files = [mockFile];
    });
});