it('should throw on invalid input.', function(done) {
    expect(function() {
        new Model().deref('testing');
    }).toThrowError(InvalidDerefInputError);
    done();
})