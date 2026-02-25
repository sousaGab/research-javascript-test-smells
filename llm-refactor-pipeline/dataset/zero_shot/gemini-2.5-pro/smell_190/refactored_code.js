test.each([
  [123],
  [456],
])('when parse is called with %p, then processedArgs is updated', (arg) => {
  const program = new commander.Command().argument(
    '<first>',
    'first arg',
    parseFloat,
  );

  program.parse([arg], { from: 'user' });

  expect(program.processedArgs).toEqual([arg]);
});