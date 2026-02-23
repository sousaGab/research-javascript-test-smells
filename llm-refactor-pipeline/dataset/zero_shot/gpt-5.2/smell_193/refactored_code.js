test('when use parse and parseAsync then option values reset', async () => {
  const program = new commander.Command().option('--black').option('--white');

  const optsAfterParse = (args) => {
    program.parse(args, { from: 'user' });
    return program.opts();
  };

  const optsAfterParseAsync = async (args) => {
    await program.parseAsync(args, { from: 'user' });
    return program.opts();
  };

  expect([
    optsAfterParse(['--black']),
    await optsAfterParseAsync(['--white']),
  ]).toEqual([{ black: true }, { white: true }]);
});