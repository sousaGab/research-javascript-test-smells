test('when specify unknown option with program argument and action handler then error', () => {
    // Regression test from #965
    const program = new commander.Command();
    program
      .exitOverride()
      .argument('[file]')
      .action(() => {});

    const call = () => program.parse(['node', 'test', 'info', 'a', '--NONSENSE']);

    expect(call).toThrow({ code: 'commander.unknownOption' });
  })