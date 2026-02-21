test('when parse with different arguments then processedArgs change', () => {
    const program = new commander.Command().argument(
      '<first>',
      'first arg',
      parseFloat,
    );

    const assertProcessedArgs = (expectedArgs) => {
        program.parse([expectedArgs], { from: 'user' });
        expect(program.processedArgs).toEqual(expectedArgs);
    };

    assertProcessedArgs([123]);
    assertProcessedArgs([456]);
});