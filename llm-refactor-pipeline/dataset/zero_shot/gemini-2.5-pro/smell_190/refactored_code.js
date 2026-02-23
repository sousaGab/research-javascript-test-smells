test('when parse with different arguments then processedArgs change', () => {
  const program = new commander.Command().argument(
    '<first>',
    'first arg',
    parseFloat,
  );

  const testCases = [
    [123],
    [456]
  ];

  testCases.forEach((args) => {
    program.parse(args, {
      from: 'user'
    });
    expect(program.processedArgs).toEqual(args);
  });
});