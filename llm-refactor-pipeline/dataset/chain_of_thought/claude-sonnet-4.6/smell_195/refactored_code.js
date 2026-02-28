const PROGRAM_HELP_WIDTH = 80;
const COPY_HELP_WIDTH = 40;

test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const program = new commander.Command();
  program.configureOutput({ getOutHelpWidth: () => PROGRAM_HELP_WIDTH });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(PROGRAM_HELP_WIDTH);
  copy.configureOutput({ getOutHelpWidth: () => COPY_HELP_WIDTH });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(COPY_HELP_WIDTH);
  expect(program.configureOutput().getOutHelpWidth()).toBe(PROGRAM_HELP_WIDTH);
})