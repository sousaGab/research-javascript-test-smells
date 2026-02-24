test('when specify unknown option with program and action handler then error', () => {
    const program = new commander.Command();
    program
      .exitOverride()
      .argument('[file]')
      .action(() => {});

    expect(() => program.parse(['node', 'test', '--NONSENSE']))
      .toThrow(expect.objectContaining({ code: 'commander.unknownOption' }));
  })