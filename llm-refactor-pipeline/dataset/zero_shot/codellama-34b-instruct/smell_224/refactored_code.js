// Your COMPLETE refactored test code here

test('styleOptionTerm', () => {
    const program = makeProgram();
    const displayWidth = 80;
    const red = (str) => `<span style="color: red">${str}</span>`;
    program.configureHelp({ styleOptionTerm: red, displayWidth });
    const helpText = program.helpInformation();
    expect(helpText).toEqual(
      plainHelpInformation.replace('-h, --help', red('-h, --help')),
    );
  })