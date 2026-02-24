test('when invalid option choice then shows help', () => {
  const { program, writeMock } = makeProgram();
  program.addOption(new commander.Option('--color').choices(['red', 'blue']));

  const caughtErr = expect(() => {
    program.parse(['--color', 'pink'], { from: 'user' });
  }).toThrowError();

  expect(caughtErr.code).toBe('commander.invalidArgument');
  expect(writeMock).toHaveBeenLastCalledWith(`${customHelpMessage}\n`);
});