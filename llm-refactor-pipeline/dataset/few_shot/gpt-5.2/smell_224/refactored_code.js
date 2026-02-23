test('styleOptionTerm applies styling to option terms in help output', () => {
  const program = makeProgram();
  program.configureHelp({ styleOptionTerm: (str) => red(str), displayWidth });

  const helpText = program.helpInformation();

  const expectedHelpText = plainHelpInformation.replace('-h, --help', red('-h, --help'));
  expect(helpText).toEqual(expectedHelpText);
});