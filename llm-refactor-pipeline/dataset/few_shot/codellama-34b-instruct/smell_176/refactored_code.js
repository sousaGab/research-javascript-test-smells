it('prints the help text', async () => {
    const parser = argsParser.options({});
    await expect(parser.parse(['--help'])).rejects.toThrow(
        (error) => error.exitCode === 0 && error.message === parser.getHelpText()
    );
});