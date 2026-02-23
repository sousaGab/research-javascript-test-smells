// Your COMPLETE refactored test code here

it('throws exception if no type given', async () => {
    await expect(new BvEvent()).rejects.toThrow('No type given');
});