test('when parse with different implied program name then name changes', () => {
  const program = new commander.Command();

  const parseAndExpectName = (argv, expectedName) => {
    program.parse(argv);
    expect(program.name()).toEqual(expectedName);
  };

  parseAndExpectName(['node', 'script1.js'], 'script1');
  parseAndExpectName(['electron', 'script2.js'], 'script2');
});