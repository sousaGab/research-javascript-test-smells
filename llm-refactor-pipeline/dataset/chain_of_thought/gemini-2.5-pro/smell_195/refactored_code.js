test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const INITIAL_HELP_WIDTH = 80;
  const UPDATED_HELP_WIDTH = 40;
  const program = new commander.Command();
  program.configureOutput({
    getOutHelpWidth: () => INITIAL_HELP_WIDTH
  });
  const copy = program.createCommand('copy');

  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(INITIAL_HELP_WIDTH);

  copy.configureOutput({
    getOutHelpWidth: () => UPDATED_HELP_WIDTH
  });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(UPDATED_HELP_WIDTH);

  expect(program.configureOutput().getOutHelpWidth()).toBe(INITIAL_HELP_WIDTH);
})