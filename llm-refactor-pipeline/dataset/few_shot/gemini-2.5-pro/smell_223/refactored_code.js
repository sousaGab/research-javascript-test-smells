test('should style command text in help output when configured with styleCommandText', () => {
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