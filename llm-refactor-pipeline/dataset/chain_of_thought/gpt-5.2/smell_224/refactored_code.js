describe('helpInformation styling', () => {
  test('applies styleOptionTerm to option terms in help output', () => {
    const program = makeProgram();
    program.configureHelp({ styleOptionTerm: (str) => red(str), displayWidth });

    const helpText = program.helpInformation();

    expect(helpText).toEqual(
      plainHelpInformation.replace('-h, --help', red('-h, --help')),
    );
  });
});