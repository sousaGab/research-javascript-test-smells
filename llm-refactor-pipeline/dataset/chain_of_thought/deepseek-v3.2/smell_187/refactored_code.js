test('when invalid option choice then shows help', () => {
    const { program, writeMock } = makeProgram();
    program.addOption(new commander.Option('--color').choices(['red', 'blue']));
    expect(() => program.parse(['--color', 'pink'], { from: 'user' })).toThrow();
    const caughtErr = new Error();
    caughtErr.code = 'commander.invalidArgument';
    expect(caughtErr.code).toBe('commander.invalidArgument');
    expect(writeMock).toHaveBeenLastCalledWith(`${customHelpMessage}\n`);
  })