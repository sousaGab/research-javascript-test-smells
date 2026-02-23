// Your COMPLETE refactored test code here

test('add base64 string', done => {
    const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
    pond.addFile(data).then(item => {
        expect(item.data).toBe(data);
        done();
    });
})