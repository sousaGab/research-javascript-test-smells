test('when use parse and parseAsync then option values reset', async () => {
    const program = new commander.Command().option('--black').option('--white');

    program.parse(['--black'], { from: 'user' });
    await program.parseAsync(['--white'], { from: 'user' });

    expect(program.opts()).toEqual({ white: true });
  });