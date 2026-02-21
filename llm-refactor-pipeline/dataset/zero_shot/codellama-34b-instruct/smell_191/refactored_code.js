test('when parse with different arguments then rawArgs change', () => {
    const program = new commander.Command()
      .argument('<first>')
      .option('--white')
      .option('--black');

    const assertRawArgs = (rawArgs, expected) => {
        expect(program.rawArgs).toEqual(rawArgs);
    };

    program.parse(['--white', 'one'], { from: 'user' });
    assertRawArgs(['--white', 'one'], ['--white', 'one']);

    program.parse(['--black', 'two'], { from: 'user' });
    assertRawArgs(['--black', 'two'], ['--black', 'two']);
})