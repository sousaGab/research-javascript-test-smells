test('when parse with different arguments then processedArgs change', () => {
    const program = new commander.Command().argument(
      '<first>',
      'first arg',
      parseFloat,
    );

    const testParse = (input, expected) => {
      program.parse([input], { from: 'user' });
      expect(program.processedArgs).toEqual([expected]);
    };

    testParse(123, 123);
    testParse(456, 456);
  })