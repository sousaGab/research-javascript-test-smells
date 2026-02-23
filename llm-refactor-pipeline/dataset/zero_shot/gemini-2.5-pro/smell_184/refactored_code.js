test('when program has required option not specified and --help then help', () => {
  const program = new commander.Command();
  program.exitOverride().requiredOption('--cheese <type>', 'cheese type');

  const action = () => program.parse(['node', 'test', '--help']);

  expect(action).toThrow(
    expect.objectContaining({
      code: 'commander.helpDisplayed'
    })
  );
});