const UNKNOWN_COMMAND = 'exampel';

test('when unknown command and showSuggestionAfterError(false) then do not show suggestion', () => {
  const program = new Command();
  program.showSuggestionAfterError(false);
  program.command('example');
  const suggestion = getSuggestion(program, UNKNOWN_COMMAND);
  expect(suggestion).toBe(null);
})