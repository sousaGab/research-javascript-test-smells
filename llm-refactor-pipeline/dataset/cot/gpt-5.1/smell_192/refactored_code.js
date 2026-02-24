test('when parse with implied program name then name matches script', () => {
  const program = new commander.Command();

  const assertProgramName = (argv, expectedName) => {
    program.parse(argv);
    expect(program.name()).toEqual(expectedName);
  };

  assertProgramName(['node', 'script1.js'], 'script1');
  assertProgramName(['electron', 'script2.js'], 'script2');
});