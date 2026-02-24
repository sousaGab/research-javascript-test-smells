test('styleCommandText applies red styling to command name in help output', () => {
  const program = makeProgram();
  program.configureHelp({
    styleCommandText: (str) => red(str),
    displayWidth,
  });
  const helpText = program.helpInformation();
  expect(helpText).toEqual(
    plainHelpInformation.replace('program', red('program')),
  );
})