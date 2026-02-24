test('when parse with different arguments then rawArgs change', () => {
  const program = new commander.Command()
    .argument('<first>')
    .option('--white')
    .option('--black');

  const assertRawArgs = (args) => {
    program.parse(args, { from: 'user' });
    expect(program.rawArgs).toEqual(args);
  };

  assertRawArgs(['--white', 'one']);
  assertRawArgs(['--black', 'two']);
});