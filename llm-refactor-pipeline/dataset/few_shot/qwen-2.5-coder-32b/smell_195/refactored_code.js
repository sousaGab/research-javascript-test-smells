test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const program = new commander.Command();
  const INITIAL_WIDTH = 80;
  const MODIFIED_WIDTH = 40;
  
  program.configureOutput({ getOutHelpWidth: () => INITIAL_WIDTH });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  
  expect(copy.configureOutput().getOutHelpWidth()).toBe(INITIAL_WIDTH);
  
  copy.configureOutput({ getOutHelpWidth: () => MODIFIED_WIDTH });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(MODIFIED_WIDTH);
  
  expect(program.configureOutput().getOutHelpWidth()).toBe(INITIAL_WIDTH);
})