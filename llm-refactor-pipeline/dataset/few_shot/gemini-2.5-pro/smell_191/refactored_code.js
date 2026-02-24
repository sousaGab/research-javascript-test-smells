test('when parse is called again then rawArgs is updated', () => {
    // weak test, would work without store/reset!
    const program = new commander.Command()
      .argument('<first>')
      .option('--white')
      .option('--black');

    program.parse(['--white', 'one'], { from: 'user' });

    program.parse(['--black', 'two'], { from: 'user' });
    expect(program.rawArgs).toEqual(['--black', 'two']);
  })