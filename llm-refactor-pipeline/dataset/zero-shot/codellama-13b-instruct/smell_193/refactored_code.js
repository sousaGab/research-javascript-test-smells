test('when use parse and parseAsync then option values reset', async () => {
    const program = new commander.Command().option('--black').option('--white');

    program.parse(['--black'], { from: 'user' });
    expect(program.opts()).toEqual({ black: true });
    await program.parseAsync(['--white'], { from: 'user' });
  })