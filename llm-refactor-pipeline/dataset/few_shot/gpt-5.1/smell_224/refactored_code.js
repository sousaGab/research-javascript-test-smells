test('styleOptionTerm', () => {
  const styleOptionTerm = (str) => red(str);
  const program = makeProgram();

  program.configureHelp({ styleOptionTerm, displayWidth });

  const helpText = program.helpInformation();
  const expectedHelpText = plainHelpInformation.replace(
    '-h, --help',
    styleOptionTerm('-h, --help'),
  );

  expect(helpText).toEqual(expectedHelpText);
})