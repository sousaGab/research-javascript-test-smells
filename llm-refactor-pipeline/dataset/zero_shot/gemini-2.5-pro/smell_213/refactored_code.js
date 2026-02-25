test('when copyInheritedSettings then copies helpOption(false)', () => {
    const source = new commander.Command();
    const cmd = new commander.Command();

    source.helpOption(false);
    cmd.copyInheritedSettings(source);

    const helpOption = cmd.options.find(option => option.flags === '-h, --help');
    expect(helpOption).toBeUndefined();
  })