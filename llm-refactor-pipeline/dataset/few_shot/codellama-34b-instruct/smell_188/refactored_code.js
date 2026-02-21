test('when unknown command then error', async () => {
    const program = new commander.Command();
    program.exitOverride().command('sub');
    await expect(program.parse('node test.js unknown'.split(' ')))
        .rejects
        .toThrow('commander.unknownCommand');
})