test('when copyInheritedSettings then copies helpOption(false)', () => {
    const source = new commander.Command();
    const cmd = new commander.Command();

    source.helpOption(false);
    cmd.copyInheritedSettings(source);
    
    // Verify the help option was properly copied
    const helpOption = cmd._getHelpOption();
    expect(helpOption).toBeNull();
});