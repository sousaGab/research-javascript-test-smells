describe('commander option parsing', () => {
  let program;

  beforeEach(() => {
    program = new commander.Command().option('--black').option('--white');
  });

  test('when using parse, then option values are set', () => {
    program.parse(['--black'], { from: 'user' });
    expect(program.opts()).toEqual({ black: true });
  });

  test('when using parseAsync after parse, then option values are reset', async () => {
    program.parse(['--black'], { from: 'user' }); // Set initial state
    await program.parseAsync(['--white'], { from: 'user' });
    expect(program.opts()).toEqual({ white: true });
  });
});