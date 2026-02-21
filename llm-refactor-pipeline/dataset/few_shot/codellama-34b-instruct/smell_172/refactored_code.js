it('throws exception if no type given', async () => {
    await expect(new BvEvent()).rejects.toThrow('No type given');
});