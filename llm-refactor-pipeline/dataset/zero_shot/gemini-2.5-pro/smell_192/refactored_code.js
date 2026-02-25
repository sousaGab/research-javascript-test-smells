test.each([
  [['node', 'script1.js'], 'script1'],
  [['electron', 'script2.js'], 'script2']
])('when parse with args %p then implied program name is %p', (args, expectedName) => {
  const program = new commander.Command();
  program.parse(args);
  expect(program.name()).toEqual(expectedName);
});