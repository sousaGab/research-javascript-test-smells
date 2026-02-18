const DEFAULT_HELP_WIDTH = 80;
const MODIFIED_HELP_WIDTH = 40;

test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const program = new commander.Command();
  program.configureOutput({ getOutHelpWidth: () => DEFAULT_HELP_WIDTH });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(DEFAULT_HELP_WIDTH);
  copy.configureOutput({ getOutHelpWidth: () => MODIFIED_HELP_WIDTH });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(MODIFIED_HELP_WIDTH);
  expect(program.configureOutput().getOutHelpWidth()).toBe(DEFAULT_HELP_WIDTH);
})