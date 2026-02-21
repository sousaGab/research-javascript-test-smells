it('should throw on invalid input.', function() {
    expect(function() {
        new Model().deref('testing');
    }).toThrow(InvalidDerefInputError);
});