const OUTPUT_WIDTH_ORIGINAL = 80;
const OUTPUT_WIDTH_COPIED = 40;

test('when configureOutput after copyInheritedSettings then original unchanged', () => {
  const program = new commander.Command();
  program.configureOutput({ getOutHelpWidth: () => OUTPUT_WIDTH_ORIGINAL });
  const copy = program.createCommand('copy');
  copy.copyInheritedSettings(program);
  expect(copy.configureOutput().getOutHelpWidth()).toBe(OUTPUT_WIDTH_ORIGINAL);
  copy.configureOutput({ getOutHelpWidth: () => OUTPUT_WIDTH_COPIED });
  expect(copy.configureOutput().getOutHelpWidth()).toBe(OUTPUT_WIDTH_COPIED);
  expect(program.configureOutput().getOutHelpWidth()).toBe(OUTPUT_WIDTH_ORIGINAL);
})