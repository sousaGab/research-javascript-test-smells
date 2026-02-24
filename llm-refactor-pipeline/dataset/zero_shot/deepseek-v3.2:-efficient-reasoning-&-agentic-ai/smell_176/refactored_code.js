it('prints the help text', function() {
  const parser = argsParser.options({});
  expect(() => parser.parse(['--help'])).toThrow(expect.objectContaining({
    exitCode: 0,
    message: parser.getHelpText()
  }));
})