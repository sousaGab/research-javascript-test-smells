test('when parse with different arguments then processedArgs change', () => {
  const program = new commander.Command().argument('<first>', 'first arg', parseFloat);

  const cases = [
    { input: [123], expected: [123] },
    { input: [456], expected: [456] },
  ];

  const results = cases.map(({ input }) => {
    program.parse(input, { from: 'user' });
    return program.processedArgs;
  });

  expect(results).toEqual(cases.map(({ expected }) => expected));
});