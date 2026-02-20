test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const program = new commander.Command();
  program.configureOutput({ getOutHelpWidth: () => 80 });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(80);
  copy.configureOutput({ getOutHelpWidth: () => 40 });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(40);
  expect(program.configureOutput().getOutHelpWidth()).toBe(80);
});