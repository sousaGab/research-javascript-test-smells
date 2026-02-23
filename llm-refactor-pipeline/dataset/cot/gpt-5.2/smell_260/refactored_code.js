test('add base64 string', async () => {
    const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';

    const item = await pond.addFile(data);

    expect(item).toBeDefined();
    expect(item.file).toBeDefined();
    expect(item.file.name).toBeDefined();
    expect(item.file.size).toBeGreaterThan(0);
});