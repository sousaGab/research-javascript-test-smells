test('when program has required option not specified and --help then help', () => {
    const program = new commander.Command();
    program.exitOverride().requiredOption('--cheese <type>', 'cheese type');

    expect(() => program.parse(['node', 'test', '--help'])).toThrow('commander.helpDisplayed');
});