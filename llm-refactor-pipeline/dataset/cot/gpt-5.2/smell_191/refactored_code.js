// Your COMPLETE refactored test code here
test('when parse with different arguments then rawArgs change', () => {
  const program = new commander.Command()
    .argument('<first>')
    .option('--white')
    .option('--black');

  const expectRawArgsAfterParse = (args, expectedRawArgs) => {
    program.parse(args, { from: 'user' });
    expect(program.rawArgs).toEqual(expectedRawArgs);
  };

  expectRawArgsAfterParse(['--white', 'one'], ['--white', 'one']);
  expectRawArgsAfterParse(['--black', 'two'], ['--black', 'two']);
});