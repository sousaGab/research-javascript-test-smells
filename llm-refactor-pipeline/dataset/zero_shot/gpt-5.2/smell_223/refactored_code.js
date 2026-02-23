test('helpInformation applies styleCommandText to command name', () => {
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