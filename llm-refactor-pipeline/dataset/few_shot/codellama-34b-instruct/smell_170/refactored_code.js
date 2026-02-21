test('when non-command argument and unknown option then error for unknown option', () => {
    const mockAction = jest.fn();
    const program = new commander.Command();
    program
      .exitOverride()
      .configureOutput({
        writeErr: () => {},
      })
      .command('install');
    program.command('*').argument('[args...]').action(mockAction);
    expect(() => program.parse(['node', 'test', 'some-argument', '--unknown'])).toThrow('commander.unknownOption');
  })