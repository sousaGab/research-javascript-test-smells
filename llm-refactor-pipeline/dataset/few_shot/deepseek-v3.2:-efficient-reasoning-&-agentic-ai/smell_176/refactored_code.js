it('prints the help text', function() {
  const parser = argsParser.options({});
  expect(() => parser.parse(['--help'])).toThrow();
  const exception = () => { parser.parse(['--help']); };
  expect(exception).toThrow();
  expect(exception().exitCode).toEqual(0);
  expect(exception().message).toEqual(parser.getHelpText());
})