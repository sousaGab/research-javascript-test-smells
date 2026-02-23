test('when parse with different implied program name then name changes', () => {
  const program = new commander.Command();

  const cases = [
    { argv: ['node', 'script1.js'], expectedName: 'script1' },
    { argv: ['electron', 'script2.js'], expectedName: 'script2' },
  ];

  const names = cases.map(({ argv }) => {
    program.parse(argv);
    return program.name();
  });

  expect(names).toEqual(cases.map(({ expectedName }) => expectedName));
});