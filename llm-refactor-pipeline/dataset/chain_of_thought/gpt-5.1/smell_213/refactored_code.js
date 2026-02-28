test('when copyInheritedSettings then disables helpOption when source has helpOption(false)', () => {
  const source = new commander.Command();
  const cmd = new commander.Command();

  source.helpOption(false);
  cmd.copyInheritedSettings(source);

  const helpOption = cmd._getHelpOption();

  expect(helpOption).toBeNull();
});