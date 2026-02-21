it('should throw on invalid input.', function(done) {
    const model = new Model();
    expect(() => model.deref('testing')).toThrow(InvalidDerefInputError.name);
    done();
});