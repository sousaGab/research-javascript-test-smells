test('styleOptionTerm', () => {
    const program = makeProgram();
    const helpText = program.helpInformation();
    expect(helpText).toEqual(
      plainHelpInformation.replace('-h, --help', red('-h, --help')),
    );
  })