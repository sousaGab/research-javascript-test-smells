// Your COMPLETE refactored test code here
test('add base64 string', () => {
    const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
    const item = pond.addFile(data);
    expect(item).toBeDefined();
});