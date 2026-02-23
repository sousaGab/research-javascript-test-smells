test('when parse with different arguments then rawArgs change', () => {
  // weak test, would work without store/reset!
  const program = new commander.Command()
    .argument('<first>')
    .option('--white')
    .option('--black');

  const cases = [
    { args: ['--white', 'one'], expected: ['--white', 'one'] },
    { args: ['--black', 'two'], expected: ['--black', 'two'] },
  ];

  cases.forEach(({ args, expected }) => {
    program.parse(args, { from: 'user' });
    expect(program.rawArgs).toEqual(expected);
  });
});