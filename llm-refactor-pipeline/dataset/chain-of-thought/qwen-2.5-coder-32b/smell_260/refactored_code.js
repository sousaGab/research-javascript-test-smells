test('add base64 string', done => {
    const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
    pond.addFile(data).then(item => {
        expect(item).toBeDefined();
        expect(item.fileSize).toBe(13);
        done();
    });
});