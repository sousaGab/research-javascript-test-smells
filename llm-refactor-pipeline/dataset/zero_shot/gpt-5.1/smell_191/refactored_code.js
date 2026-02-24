test('when parse with different arguments then rawArgs change', () => {
  const program = new commander.Command()
    .argument('<first>')
    .option('--white')
    .option('--black');

  const testCases = [
    { args: ['--white', 'one'], expected: ['--white', 'one'] },
    { args: ['--black', 'two'], expected: ['--black', 'two'] },
  ];

  testCases.forEach(({ args, expected }) => {
    program.parse(args, { from: 'user' });
    expect(program.rawArgs).toEqual(expected);
  });
});