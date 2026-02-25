test('add base64 string', async () => {
    const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
    const item = await pond.addFile(data);
    expect(item.file.type).toBe('text/plain');
    expect(item.file.size).toBe(13);
});