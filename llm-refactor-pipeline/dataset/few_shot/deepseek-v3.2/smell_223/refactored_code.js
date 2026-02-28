test('styleCommandText', () => {
  const program = makeProgram();
  const expectedHelpText = plainHelpInformation.replace('program', red('program'));
  
  program.configureHelp({
    styleCommandText: (str) => red(str),
    displayWidth,
  });
  
  const helpText = program.helpInformation();
  expect(helpText).toEqual(expectedHelpText);
});