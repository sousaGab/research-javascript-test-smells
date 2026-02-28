test('when use parse and parseAsync then option values reset', async () => {
  const program = new commander.Command().option('--black').option('--white');

  program.parse(['--black'], { from: 'user' });
  const afterParseOpts = program.opts();
  expect(afterParseOpts.black).toBe(true);
  expect(afterParseOpts.white).toBeUndefined();

  await program.parseAsync(['--white'], { from: 'user' });
  const afterParseAsyncOpts = program.opts();
  expect(afterParseAsyncOpts.white).toBe(true);
  expect(afterParseAsyncOpts.black).toBeUndefined();
});