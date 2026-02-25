test('add base64 string', async () => {
    const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
    await pond.addFile(data);
    expect(pond.getFiles().length).toBe(1);
});