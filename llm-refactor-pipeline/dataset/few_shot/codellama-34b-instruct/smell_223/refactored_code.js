test('styleCommandText', () => {
    const program = makeProgram();
    const helpText = program.helpInformation();
    expect(helpText).toEqual(
      plainHelpInformation.replace('program', red('program')),
    );
  })