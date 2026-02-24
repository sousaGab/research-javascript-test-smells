test('when parse with different arguments then rawArgs change', () => {
    // weak test, would work without store/reset!
    const program = new commander.Command()
      .argument('<first>')
      .option('--white')
      .option('--black');

    program.parse(['--white', 'one'], { from: 'user' });

    program.parse(['--black', 'two'], { from: 'user' });
    expect(program.rawArgs).toEqual(['--black', 'two']);
  })