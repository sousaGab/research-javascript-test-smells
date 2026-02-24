test('when use parse and parseAsync then option values reset', async () => {
  const program = new commander.Command().option('--black').option('--white');

  program.parse(['--black'], { from: 'user' });
  const optsAfterParse = program.opts();
  expect(optsAfterParse.black).toBe(true);
  expect(optsAfterParse.white).toBeUndefined();

  await program.parseAsync(['--white'], { from: 'user' });
  const optsAfterParseAsync = program.opts();
  expect(optsAfterParseAsync.white).toBe(true);
  expect(optsAfterParseAsync.black).toBeUndefined();
})