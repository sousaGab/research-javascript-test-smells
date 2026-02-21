test('styleOptionTerm should style the option term', () => {
    const program = makeProgram();
    const helpText = getHelpText(program);
    expect(helpText).toEqual(
      plainHelpInformation.replace('-h, --help', red('-h, --help')),
    );
  })

function makeProgram() {
    return new Program()
      .configureHelp({ styleOptionTerm: (str) => red(str), displayWidth });
}

function getHelpText(program) {
    return program.helpInformation();
}