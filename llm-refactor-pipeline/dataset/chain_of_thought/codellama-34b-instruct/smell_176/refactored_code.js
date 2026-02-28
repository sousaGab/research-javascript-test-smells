// Your COMPLETE refactored test code here
it('prints the help text', function() {
    const parser = argsParser.options({});
    expect(parser.parse(['--help'])).toThrow(parser.getHelpText());
})