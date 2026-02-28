test('when copyInheritedSettings then copies helpOption(false)', () => {
  const source = new commander.Command();
  source.helpOption(false);

  const cmd = new commander.Command();
  cmd.copyInheritedSettings(source);

  expect(cmd._getHelpOption()).toBeNull();
});