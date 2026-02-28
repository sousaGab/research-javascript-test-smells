test('add base64 string', () => {
    const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
    return pond.addFile(data).then(item => {
        expect(item).toBeDefined();
    });
});