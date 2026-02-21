describe('styleCommandText configuration', () => {
  test('should apply red styling to command text in help information', () => {
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
});