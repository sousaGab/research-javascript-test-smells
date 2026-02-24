test('does not suggest subcommand when using global option with positional options', () => {
  const program = new Command();
  program.enablePositionalOptions();
  program.option('-g, --global');
  program.command('sub');

  const suggestion = getSuggestion(program, ['sub', '--globla']);

  expect(suggestion).toBeNull();
});