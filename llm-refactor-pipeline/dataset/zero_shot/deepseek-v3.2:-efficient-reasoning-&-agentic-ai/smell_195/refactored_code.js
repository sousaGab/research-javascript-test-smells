test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const ORIGINAL_WIDTH = 80;
  const NEW_WIDTH = 40;
  
  const program = new commander.Command();
  program.configureOutput({ getOutHelpWidth: () => ORIGINAL_WIDTH });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  
  expect(copy.configureOutput().getOutHelpWidth()).toBe(ORIGINAL_WIDTH);
  copy.configureOutput({ getOutHelpWidth: () => NEW_WIDTH });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(NEW_WIDTH);
  expect(program.configureOutput().getOutHelpWidth()).toBe(ORIGINAL_WIDTH);
});