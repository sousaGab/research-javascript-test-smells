test('styleCommandText applies red color to program command', () => {
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