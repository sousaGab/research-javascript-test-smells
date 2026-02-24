it('prints the help text', function() {
    const parser = argsParser.options({});
    expect(() => parser.parse(['--help'])).toThrow();
    const exception = () => { parser.parse(['--help']); };
    expect(exception).toThrow(expect.objectContaining({
      exitCode: 0,
      message: parser.getHelpText()
    }));
  })