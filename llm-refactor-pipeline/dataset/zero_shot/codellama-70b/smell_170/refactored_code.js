test('when non-command argument and unknown option then error for unknown option', () => {
    // This is a change in behaviour from v2 which did not error, but is consistent with modern better detection of invalid options
    const mockAction = jest.fn();
    const program = new commander.Command();
    program
      .exitOverride()
      .configureOutput({
        writeErr: () => {},
      })
      .command('install');
    program.command('*').argument('[args...]').action(mockAction);
    expect(() => program.parse(['node', 'test', 'some-argument', '--unknown'])).toThrowError({ code: 'commander.unknownOption' });
  })