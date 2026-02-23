const HELP_OPTION_EXPECTED_VALUE = null;

test('when copyInheritedSettings then copies helpOption(false)', () => {
    const source = new commander.Command();
    const cmd = new commander.Command();

    source.helpOption(false);
    cmd.copyInheritedSettings(source);
    expect(cmd._getHelpOption()).toBe(HELP_OPTION_EXPECTED_VALUE);
  })