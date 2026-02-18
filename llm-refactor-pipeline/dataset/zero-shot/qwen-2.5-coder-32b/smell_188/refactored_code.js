test('when unknown command then error', () => {
    const program = new commander.Command();
    program.exitOverride().command('sub');
    expect(() => program.parse('node test.js unknown'.split(' ')))
        .toThrow('commander.unknownCommand');
});