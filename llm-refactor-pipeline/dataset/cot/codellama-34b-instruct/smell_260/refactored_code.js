test('add base64 string', () => {
    const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
    const item = pond.addFile(data);
    expect(item).toBeDefined();
    expect(item.type).toBe('text/plain');
    expect(item.data).toBe('SGVsbG8sIFdvcmxkIQ==');
})