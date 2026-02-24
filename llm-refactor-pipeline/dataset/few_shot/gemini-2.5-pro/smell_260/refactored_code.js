test('add base64 string', async () => {
    const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
    await pond.addFile(data);
    const files = pond.getFiles();
    expect(files.length).toBe(1);
    expect(files[0].file.size).toBe(13);
    expect(files[0].file.type).toBe('text/plain');
});