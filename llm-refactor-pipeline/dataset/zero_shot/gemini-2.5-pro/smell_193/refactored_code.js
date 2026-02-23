test('when use parse and parseAsync then option values reset', async () => {
  const program = new commander.Command().option('--black').option('--white');
  const results = [];

  program.parse(['--black'], { from: 'user' });
  results.push(program.opts());

  await program.parseAsync(['--white'], { from: 'user' });
  results.push(program.opts());

  expect(results).toEqual([
    { black: true },
    { white: true }
  ]);
});