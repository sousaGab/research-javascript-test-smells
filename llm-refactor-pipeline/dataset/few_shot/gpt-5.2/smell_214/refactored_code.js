test('when unknown command and showSuggestionAfterError(false) then do not show suggestion', () => {
  const program = new Command();
  program.showSuggestionAfterError(false);
  program.command('example');

  expect(getSuggestion(program, 'exampel')).toBeNull();
});