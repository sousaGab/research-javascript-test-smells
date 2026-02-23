describe('when parse is called sequentially', () => {
  const program = new commander.Command()
    .argument('<first>')
    .option('--white')
    .option('--black');

  test.each([
    [['--white', 'one']],
    [['--black', 'two']]
  ])('with args %p, then rawArgs is updated correctly', (args) => {
    program.parse(args, { from: 'user' });
    expect(program.rawArgs).toEqual(args);
  });
});