test.each([
  { argv: ['node', 'script1.js'], expectedName: 'script1' },
  { argv: ['electron', 'script2.js'], expectedName: 'script2' }
])('when parse with argv $argv then name is $expectedName', ({ argv, expectedName }) => {
  const program = new commander.Command();
  program.parse(argv);
  expect(program.name()).toEqual(expectedName);
});