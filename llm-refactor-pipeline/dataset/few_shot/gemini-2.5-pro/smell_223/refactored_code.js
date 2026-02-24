test('should style command text in help output when styleCommandText option is used', () => {
  const program = makeProgram();
  program.configureHelp({
    styleCommandText: (str) => red(str),
    displayWidth,
  });
  const helpText = program.helpInformation();
  expect(helpText).toEqual(
    plainHelpInformation.replace('program', red('program')),
  );
});