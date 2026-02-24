test('when parse with different implied program name then name changes', () => {
  const program = new commander.Command();
  const testCases = [
    { args: ['node', 'script1.js'], expected: 'script1' },
    { args: ['electron', 'script2.js'], expected: 'script2' }
  ];

  testCases.forEach(({ args, expected }) => {
    program.parse(args);
    expect(program.name()).toEqual(expected);
  });
})