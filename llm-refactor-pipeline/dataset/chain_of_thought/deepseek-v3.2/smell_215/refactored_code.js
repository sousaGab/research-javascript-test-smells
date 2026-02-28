test('when global option but positionalOptions then not candidate for subcommand suggestion', () => {
  const program = new Command();
  program.enablePositionalOptions();
  program.option('-g, --global');
  program.command('sub');
  
  const suggestion = getSuggestion(program, ['sub', '--globla']);
  
  expect(suggestion).toBeNull();
});