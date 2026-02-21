test('when invalid option choice then shows help', async () => {
    const { program, writeMock } = makeProgram();
    program.addOption(new commander.Option('--color').choices(['red', 'blue']));
    await expect(program.parse(['--color', 'pink'], { from: 'user' }))
        .rejects
        .toThrow('commander.invalidArgument');
    expect(writeMock).toHaveBeenLastCalledWith(`${customHelpMessage}\n`);
})