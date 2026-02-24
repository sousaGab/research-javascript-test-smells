test('when parse with different arguments then rawArgs change', () => {
  const program = new commander.Command()
    .argument('<first>')
    .option('--white')
    .option('--black');

  program.parse(['--white', 'one'], { from: 'user' });
  const firstRawArgs = program.rawArgs.slice();

  program.parse(['--black', 'two'], { from: 'user' });
  const secondRawArgs = program.rawArgs.slice();

  expect(firstRawArgs).not.toEqual(secondRawArgs);
});