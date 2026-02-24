test('when parse with first arguments then processedArgs change', () => {
  const program = new commander.Command().argument(
    '<first>',
    'first arg',
    parseFloat,
  );

  program.parse([123], { from: 'user' });
  expect(program.processedArgs).toEqual([123]);
});

test('when parse with second arguments then processedArgs change', () => {
  const program = new commander.Command().argument(
    '<first>',
    'first arg',
    parseFloat,
  );

  program.parse([456], { from: 'user' });
  expect(program.processedArgs).toEqual([456]);
});