test('add base64 string', done => {
    const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
    pond.addFile(data).then(item => {
        try {
            expect(item).toBeDefined();
            expect(item.source).toBe(data);
            done();
        } catch (error) {
            done(error);
        }
    });
});