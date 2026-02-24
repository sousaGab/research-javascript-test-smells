test('when parse with different arguments then processedArgs change', () => {
    const program = new commander.Command().argument(
      '<first>',
      'first arg',
      parseFloat,
    );

    // Arrange: Set an initial state by parsing once.
    program.parse([123], { from: 'user' });

    // Act: Parse again with different arguments to test the state update.
    program.parse([456], { from: 'user' });

    // Assert: Verify that the arguments have been updated.
    expect(program.processedArgs).toEqual([456]);
  })