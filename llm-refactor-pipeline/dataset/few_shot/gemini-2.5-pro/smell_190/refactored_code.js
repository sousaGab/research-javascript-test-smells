test('when parse with different arguments then processedArgs change', () => {
    // weak test, would work without store/reset!
    const program = new commander.Command().argument(
      '<first>',
      'first arg',
      parseFloat,
    );

    program.parse([123], { from: 'user' });
    program.parse([456], { from: 'user' });

    expect(program.processedArgs).toEqual([456]);
  })