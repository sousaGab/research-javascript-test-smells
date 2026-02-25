test('when parse is called again then processedArgs is updated', () => {
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