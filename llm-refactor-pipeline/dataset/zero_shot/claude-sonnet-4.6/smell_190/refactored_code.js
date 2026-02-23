test('when parse with different arguments then processedArgs change', () => {
    const program = new commander.Command().argument(
      '<first>',
      'first arg',
      parseFloat,
    );

    program.parse([123], { from: 'user' });
    const firstResult = program.processedArgs;

    program.parse([456], { from: 'user' });
    const secondResult = program.processedArgs;

    expect(firstResult).toEqual([123]);
    expect(secondResult).toEqual([456]);
    expect(firstResult).not.toEqual(secondResult);
  })