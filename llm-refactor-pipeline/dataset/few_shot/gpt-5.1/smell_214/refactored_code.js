test('does not show suggestion for unknown command when suggestions are disabled', () => {
  const program = new Command();
  program.showSuggestionAfterError(false);
  program.command('example');

  const suggestion = getSuggestion(program, 'exampel');

  expect(suggestion).toBeNull();
});