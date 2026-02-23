test('when parse with different arguments then processedArgs change', () => {
    const program = new commander.Command().argument(
      '<first>',
      'first arg',
      parseFloat,
    );

    program.parse([456], { from: 'user' });
    expect(program.processedArgs).toEqual([456]);
  })