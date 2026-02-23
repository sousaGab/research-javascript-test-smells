test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const originalHelpWidth = 80;
  const newHelpWidth = 40;

  const program = new commander.Command();
  program.configureOutput({ getOutHelpWidth: () => originalHelpWidth });

  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(originalHelpWidth);

  copy.configureOutput({ getOutHelpWidth: () => newHelpWidth });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(newHelpWidth);

  expect(program.configureOutput().getOutHelpWidth()).toBe(originalHelpWidth);
});