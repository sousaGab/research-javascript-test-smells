it('should throw on invalid input.', function(done) {
    expect(() => new Model().deref('testing')).toThrow(InvalidDerefInputError.name);
    done();
});