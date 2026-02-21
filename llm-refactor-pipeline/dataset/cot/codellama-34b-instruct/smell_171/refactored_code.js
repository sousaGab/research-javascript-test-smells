test('when no arguments then asterisk action not called', () => {
    const writeMock = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => {});
    const mockAction = jest.fn();
    const program = new commander.Command();
    program
      .exitOverride() // to catch help
      .command('*')
      .action(mockAction);
    program.parse(['node', 'test']);
    expect(mockAction).not.toHaveBeenCalled();
    writeMock.mockRestore();
  })