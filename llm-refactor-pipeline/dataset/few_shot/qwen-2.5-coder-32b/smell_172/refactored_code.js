it('throws exception if no type given', async () => {
    await expect(() => new BvEvent()).toThrow();
});