test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const initialHelpWidth = 80;
  const newHelpWidth = 40;

  const program = new commander.Command();
  program.configureOutput({ getOutHelpWidth: () => initialHelpWidth });

  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(initialHelpWidth);

  copy.configureOutput({ getOutHelpWidth: () => newHelpWidth });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(newHelpWidth);
  expect(program.configureOutput().getOutHelpWidth()).toBe(initialHelpWidth);
});