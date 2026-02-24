describe('styleCommandText', () => {
  const getStyledHelpText = () => {
    const program = makeProgram();
    program.configureHelp({
      styleCommandText: (str) => red(str),
      displayWidth,
    });
    return program.helpInformation();
  };

  const getExpectedStyledHelpText = () =>
    plainHelpInformation.replace('program', red('program'));

  test('applies custom style to command text in help output', () => {
    const helpText = getStyledHelpText();
    const expectedHelpText = getExpectedStyledHelpText();

    expect(helpText).toEqual(expectedHelpText);
  });
});