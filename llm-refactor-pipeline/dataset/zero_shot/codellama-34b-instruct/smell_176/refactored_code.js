it('prints the help text', function() {
    const parser = argsParser.options({});
    expect(parser.parse(['--help'])).toThrow(new Error('Help text'));
    expect(parser.getHelpText()).toEqual('Help text');
  })