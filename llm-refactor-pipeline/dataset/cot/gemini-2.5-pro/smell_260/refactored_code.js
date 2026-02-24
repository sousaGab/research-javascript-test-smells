test('add base64 string', async () => {
    const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
    const item = await pond.addFile(data);
    expect(item.fileSize).toBe(13);
    expect(item.fileType).toBe('text/plain');
});