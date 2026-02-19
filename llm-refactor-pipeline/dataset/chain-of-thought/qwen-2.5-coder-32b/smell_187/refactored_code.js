test('when invalid option choice then shows help', () => {
    const { program, writeMock } = makeProgram();
    program.addOption(new commander.Option('--color').choices(['red', 'blue']));
    expect(() => {
      program.parse(['--color', 'pink'], { from: 'user' });
    }).toThrow('commander.invalidArgument');
    expect(writeMock).toHaveBeenLastCalledWith(`${customHelpMessage}\n`);
  })