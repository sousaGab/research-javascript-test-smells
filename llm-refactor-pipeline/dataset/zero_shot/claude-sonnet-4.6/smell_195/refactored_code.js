test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const originalWidth = 80;
  const copyWidth = 40;
  const program = new commander.Command();
  program.configureOutput({ getOutHelpWidth: () => originalWidth });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(originalWidth);
  copy.configureOutput({ getOutHelpWidth: () => copyWidth });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(copyWidth);
  expect(program.configureOutput().getOutHelpWidth()).toBe(originalWidth);
})