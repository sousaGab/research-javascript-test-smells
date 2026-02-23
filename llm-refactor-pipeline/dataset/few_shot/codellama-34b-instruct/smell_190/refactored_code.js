// Your COMPLETE refactored test code here

test('when parse with different arguments then processedArgs change', () => {
    const program = new commander.Command().argument(
      '<first>',
      'first arg',
      parseFloat,
    );

    program.parse([123], { from: 'user' });
    expect(program.processedArgs).toEqual([123]);

    program.parse([456], { from: 'user' });
    expect(program.processedArgs).toEqual([456]);
  })