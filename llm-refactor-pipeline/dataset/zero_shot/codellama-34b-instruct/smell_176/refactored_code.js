it('prints the help text', function() {
    const parser = argsParser.options({});
    expect(function() {
        parser.parse(['--help']);
    }).toThrow({
        exitCode: 0,
        message: parser.getHelpText()
    });
})