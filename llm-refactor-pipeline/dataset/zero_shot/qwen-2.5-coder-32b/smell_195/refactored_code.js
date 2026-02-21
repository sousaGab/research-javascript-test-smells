test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const PROGRAM_WIDTH = 80;
  const COPY_WIDTH = 40;
  
  const program = new commander.Command();
  program.configureOutput({ getOutHelpWidth: () => PROGRAM_WIDTH });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(PROGRAM_WIDTH);
  copy.configureOutput({ getOutHelpWidth: () => COPY_WIDTH });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(COPY_WIDTH);
  expect(program.configureOutput().getOutHelpWidth()).toBe(PROGRAM_WIDTH);
})