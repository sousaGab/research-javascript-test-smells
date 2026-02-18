test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const program = new commander.Command();
  const expectedWidth = 80;
  const modifiedWidth = 40;
  
  program.configureOutput({ getOutHelpWidth: () => expectedWidth });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(expectedWidth);
  copy.configureOutput({ getOutHelpWidth: () => modifiedWidth });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(modifiedWidth);
  expect(program.configureOutput().getOutHelpWidth()).toBe(expectedWidth);
})