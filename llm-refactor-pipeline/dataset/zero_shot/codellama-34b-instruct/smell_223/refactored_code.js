test('styleCommandText', () => {
    const program = makeProgram();
    program.configureHelp({
      styleCommandText: styleCommandText,
      displayWidth,
    });
    const helpText = program.helpInformation();
    expect(helpText).toEqual(
      plainHelpInformation.replace('program', red('program')),
    );
  })

function styleCommandText(str) {
    return red(str);
}