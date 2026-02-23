// Your COMPLETE refactored test code here
test('when parse with different arguments then rawArgs change', () => {
    const program = new commander.Command()
      .argument('<first>')
      .option('--white')
      .option('--black');

    program.parse(['--white', 'one'], { from: 'user' });
    expect(program.rawArgs).toEqual(['--white', 'one']);

    program.parse(['--black', 'two'], { from: 'user' });
    expect(program.rawArgs).toEqual(['--black', 'two']);
  })