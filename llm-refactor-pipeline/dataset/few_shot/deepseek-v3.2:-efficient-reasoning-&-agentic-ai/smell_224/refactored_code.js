test('styleOptionTerm', () => {
  const program = makeProgram();
  const styleOptionTerm = (str) => red(str);
  
  program.configureHelp({ styleOptionTerm, displayWidth });
  const helpText = program.helpInformation();
  
  const expectedHelpText = plainHelpInformation.replace('-h, --help', red('-h, --help'));
  expect(helpText).toEqual(expectedHelpText);
});