test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const program = new commander.Command();
  const originalHelpWidth = 80;
  program.configureOutput({ getOutHelpWidth: () => originalHelpWidth });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(originalHelpWidth);
  copy.configureOutput({ getOutHelpWidth: () => 40 });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(40);
  expect(program.configureOutput().getOutHelpWidth()).toBe(originalHelpWidth);
})