describe('Help styling', () => {
  function createStyledHelpProgram() {
    const program = makeProgram();
    program.configureHelp({ styleOptionTerm: (str) => red(str), displayWidth });
    return program;
  }

  test('styleOptionTerm applies red styling to option terms in help output', () => {
    const program = createStyledHelpProgram();
    const helpText = program.helpInformation();
    const expectedHelpText = plainHelpInformation.replace(
      '-h, --help',
      red('-h, --help'),
    );

    expect(helpText).toEqual(expectedHelpText);
  });
});