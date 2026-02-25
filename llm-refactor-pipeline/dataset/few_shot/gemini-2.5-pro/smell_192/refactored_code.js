describe('when parse is used with different implied program names', () => {
  test('should set the name from the script when parsed with node', () => {
    const program = new commander.Command();
    program.parse(['node', 'script1.js']);
    expect(program.name()).toEqual('script1');
  });

  test('should set the name from the script when parsed with electron', () => {
    const program = new commander.Command();
    program.parse(['electron', 'script2.js']);
    expect(program.name()).toEqual('script2');
  });
});