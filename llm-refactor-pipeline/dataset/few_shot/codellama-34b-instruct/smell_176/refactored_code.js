// Your COMPLETE refactored test code here

it('prints the help text', function() {
    const parser = argsParser.options({});
    await expect(parser.parse(['--help'])).rejects.toThrow(0);
    expect(exception.message).toEqual(parser.getHelpText());
})