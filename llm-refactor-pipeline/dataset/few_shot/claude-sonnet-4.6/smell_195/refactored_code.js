const ORIGINAL_WIDTH = 80;
const UPDATED_WIDTH = 40;

test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const program = new commander.Command();
  program.configureOutput({ getOutHelpWidth: () => ORIGINAL_WIDTH });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(ORIGINAL_WIDTH);
  copy.configureOutput({ getOutHelpWidth: () => UPDATED_WIDTH });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(UPDATED_WIDTH);
  expect(program.configureOutput().getOutHelpWidth()).toBe(ORIGINAL_WIDTH);
});