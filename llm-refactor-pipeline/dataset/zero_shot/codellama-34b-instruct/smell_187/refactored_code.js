// Your COMPLETE refactored test code here

test('when invalid option choice then shows help', () => {
    const { program, writeMock } = makeProgram();
    program.addOption(new commander.Option('--color').choices(['red', 'blue']));
    const caughtErr = program.parse(['--color', 'pink'], { from: 'user' });
    expect(caughtErr.code).toBe('commander.invalidArgument');
    expect(writeMock).toHaveBeenLastCalledWith(`${customHelpMessage}\n`);
  })