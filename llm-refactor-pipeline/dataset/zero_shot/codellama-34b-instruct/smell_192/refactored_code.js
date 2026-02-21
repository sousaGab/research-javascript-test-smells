test('when parse with different implied program name then name changes', () => {
    const program = new commander.Command();

    program.parse(['node', 'script1.js']);
    expect(program.name()).toEqual('script1');
  })

test('when parse with different implied program name then name changes', () => {
    const program = new commander.Command();

    program.parse(['electron', 'script2.js']);
    expect(program.name()).toEqual('script2');
  })