test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const program = new commander.Command();
  const ORIGINAL_OUTPUT_WIDTH = 80;
  const COPY_OUTPUT_WIDTH = 40;
  program.configureOutput({ getOutHelpWidth: () => ORIGINAL_OUTPUT_WIDTH });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(ORIGINAL_OUTPUT_WIDTH);
  copy.configureOutput({ getOutHelpWidth: () => COPY_OUTPUT_WIDTH });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(COPY_OUTPUT_WIDTH);
  expect(program.configureOutput().getOutHelpWidth()).toBe(ORIGINAL_OUTPUT_WIDTH);
})