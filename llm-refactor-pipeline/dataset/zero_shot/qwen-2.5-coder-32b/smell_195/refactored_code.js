test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const PROGRAM_OUTPUT_WIDTH = 80;
  const COPY_OUTPUT_WIDTH = 40;
  
  const program = new commander.Command();
  program.configureOutput({ getOutHelpWidth: () => PROGRAM_OUTPUT_WIDTH });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(PROGRAM_OUTPUT_WIDTH);
  copy.configureOutput({ getOutHelpWidth: () => COPY_OUTPUT_WIDTH });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(COPY_OUTPUT_WIDTH);
  expect(program.configureOutput().getOutHelpWidth()).toBe(PROGRAM_OUTPUT_WIDTH);
})