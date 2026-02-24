it('should throw on invalid input.', function() {
    expect(() => new Model().deref('testing')).toThrowError(InvalidDerefInputError);
})