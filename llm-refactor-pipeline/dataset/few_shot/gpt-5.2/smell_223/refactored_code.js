test('styleCommandText should style the command name in help output', () => {
  const program = makeProgram();
  program.configureHelp({
    styleCommandText: (str) => red(str),
    displayWidth,
  });

  const helpText = program.helpInformation();

  const expectedHelpText = plainHelpInformation.replace('program', red('program'));
  expect(helpText).toEqual(expectedHelpText);
});