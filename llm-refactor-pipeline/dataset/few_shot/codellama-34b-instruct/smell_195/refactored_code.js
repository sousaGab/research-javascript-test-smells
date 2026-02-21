test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const program = new commander.Command();
  const originalOutputWidth = 80;
  program.configureOutput({ getOutHelpWidth: () => originalOutputWidth });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(originalOutputWidth);
  const newOutputWidth = 40;
  copy.configureOutput({ getOutHelpWidth: () => newOutputWidth });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(newOutputWidth);
  expect(program.configureOutput().getOutHelpWidth()).toBe(originalOutputWidth);
})