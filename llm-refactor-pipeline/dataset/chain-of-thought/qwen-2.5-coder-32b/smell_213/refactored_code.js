test('when copyInheritedSettings is called then helpOption is copied from source', () => {
    const source = new commander.Command();
    const cmd = new commander.Command();

    source.helpOption(false);
    cmd.copyInheritedSettings(source);
    
    expect(cmd._getHelpOption()).toBeNull();
});