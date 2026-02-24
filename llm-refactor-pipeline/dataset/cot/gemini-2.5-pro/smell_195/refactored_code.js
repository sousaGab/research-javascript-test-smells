test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const ORIGINAL_HELP_WIDTH = 80;
  const NEW_HELP_WIDTH = 40;
  const program = new commander.Command();
  program.configureOutput({
    getOutHelpWidth: () => ORIGINAL_HELP_WIDTH
  });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(ORIGINAL_HELP_WIDTH);
  copy.configureOutput({
    getOutHelpWidth: () => NEW_HELP_WIDTH
  });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(NEW_HELP_WIDTH);
  expect(program.configureOutput().getOutHelpWidth()).toBe(ORIGINAL_HELP_WIDTH);
})