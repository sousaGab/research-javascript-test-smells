test('styleOptionTerm applies red color to help text', () => {
    const program = makeProgram();
    program.configureHelp({ styleOptionTerm: (str) => red(str), displayWidth });
    const helpText = program.helpInformation();
    expect(helpText).toEqual(
      plainHelpInformation.replace('-h, --help', red('-h, --help')),
    );
  })