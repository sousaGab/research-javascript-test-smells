test('add base64 string', async () => {
    const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
    const item = await pond.addFile(data);

    expect(item).toBeDefined();
    expect(item.file).toBeDefined();
    expect(item.file instanceof File).toBe(true);
    expect(item.file.type).toBe('text/plain');

    const text = await item.file.text();
    expect(text).toBe('Hello, World!');
});