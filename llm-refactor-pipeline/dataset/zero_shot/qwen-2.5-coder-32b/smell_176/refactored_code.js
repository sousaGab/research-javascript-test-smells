it('prints the help text', function() {
    const parser = argsParser.options({});
    expect(() => parser.parse(['--help'])).toThrow();
    const exception = expect(() => parser.parse(['--help'])).toThrow();
    expect(exception.exitCode).toEqual(0);
    expect(exception.message).toEqual(parser.getHelpText());
  })