test('when helpOption(false) then -h is an unknown option', () => {
    const program = new commander.Command();
    program.exitOverride().helpOption(false);
    expect(() => program.parse(['-h'], { from: 'user' })).toThrow(expect.objectContaining({ code: 'commander.unknownOption' }));
  })