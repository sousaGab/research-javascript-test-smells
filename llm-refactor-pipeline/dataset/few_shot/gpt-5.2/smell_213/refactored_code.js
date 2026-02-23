test('when copyInheritedSettings then copies helpOption(false)', () => {
  const source = new commander.Command();
  source.helpOption(false);

  const cmd = new commander.Command();
  cmd.copyInheritedSettings(source);

  const helpOption = cmd._getHelpOption();
  expect(helpOption).toBeNull();
});