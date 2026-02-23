it('styleOptionTerm should apply custom styling to option terms', () => {
    const program = makeProgram();
    program.configureHelp({ styleOptionTerm: (str) => red(str), displayWidth });
    const helpText = program.helpInformation();
    expect(helpText).toEqual(
      plainHelpInformation.replace('-h, --help', red('-h, --help')),
    );
  })