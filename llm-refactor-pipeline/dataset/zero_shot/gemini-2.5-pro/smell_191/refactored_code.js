test.each([
  [['--white', 'one']],
  [['--black', 'two']]
])('when parse is called with arguments %p, then rawArgs is set to the parsed arguments', (args) => {
  const program = new commander.Command()
    .argument('<first>')
    .option('--white')
    .option('--black');

  program.parse(args, { from: 'user' });

  expect(program.rawArgs).toEqual(args);
});