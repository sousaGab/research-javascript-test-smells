it('should throw on invalid input.', () => {
    expect(() => new Model().deref('testing')).toThrow(InvalidDerefInputError);
});