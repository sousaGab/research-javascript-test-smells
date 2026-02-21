it('should throw on invalid input.', async () => {
    await expect(new Model().deref('testing')).rejects.toThrow(InvalidDerefInputError);
});