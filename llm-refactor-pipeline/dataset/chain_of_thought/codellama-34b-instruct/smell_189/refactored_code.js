// Your COMPLETE refactored test code here
it('should throw on invalid input.', function(done) {
    expect(() => new Model().deref('testing')).toThrow(InvalidDerefInputError.name);
    done();
})