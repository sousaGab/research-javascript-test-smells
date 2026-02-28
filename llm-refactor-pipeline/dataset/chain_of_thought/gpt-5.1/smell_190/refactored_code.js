test('when parse with different arguments then processedArgs change', () => {
  const program = new commander.Command().argument(
    '<first>',
    'first arg',
    parseFloat,
  );

  program.parse([123], { from: 'user' });
  const firstProcessedArgs = [...program.processedArgs];

  program.parse([456], { from: 'user' });
  const secondProcessedArgs = [...program.processedArgs];

  expect(firstProcessedArgs).not.toEqual(secondProcessedArgs);
});