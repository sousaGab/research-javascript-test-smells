test('when parse with different implied program name then name changes', () => {
    const program = new commander.Command();
    // Set an initial state
    program.parse(['node', 'script1.js']);

    // Act by parsing again, which should change the name
    program.parse(['electron', 'script2.js']);

    // Assert the final state is correct
    expect(program.name()).toEqual('script2');
  })