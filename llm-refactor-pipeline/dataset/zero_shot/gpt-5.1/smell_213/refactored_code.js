test('when copyInheritedSettings then disables help option when source has helpOption(false)', () => {
  const source = new commander.Command();
  const cmd = new commander.Command();

  source.helpOption(false);
  cmd.copyInheritedSettings(source);

  expect(cmd._getHelpOption()).toBeNull();
});