test.each([
  [123, [123]],
  [456, [456]]
])('when parse with argument %s then processedArgs becomes %p', (input, expected) => {
  const program = new commander.Command().argument('<first>', 'first arg', parseFloat);
  program.parse([input], { from: 'user' });
  expect(program.processedArgs).toEqual(expected);
});