test('when invalid option choice then shows help', () => {
    const { program, writeMock } = makeProgram();
    program.addOption(new commander.Option('--color').choices(['red', 'blue']));

    expect(() => program.parse(['--color', 'pink'], { from: 'user' }))
      .toThrow((err) => {
        expect(err.code).toBe('commander.invalidArgument');
        expect(writeMock).toHaveBeenLastCalledWith(`${customHelpMessage}\n`);
        return true; // Indicates the error is the one we expected
      });
  })