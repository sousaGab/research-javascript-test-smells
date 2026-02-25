it('prints the help text', function() {
    const parser = argsParser.options({});
    expect(() => parser.parse(['--help'])).toThrowError(0);
    expect(() => parser.parse(['--help'])).toThrowError(parser.getHelpText());
  })