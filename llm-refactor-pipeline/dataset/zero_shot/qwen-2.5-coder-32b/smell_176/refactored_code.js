it('prints the help text', function() {
    const parser = argsParser.options({});
    expect(() => parser.parse(['--help'])).toThrow((e) => {
        expect(e.exitCode).toEqual(0);
        expect(e.message).toEqual(parser.getHelpText());
    });
});