describe('when parse is used to imply program name', () => {
  test('should infer program name from script when run with node', () => {
    const program = new commander.Command();
    program.parse(['node', 'script1.js']);
    expect(program.name()).toEqual('script1');
  });

  test('should infer program name from script when run with electron', () => {
    const program = new commander.Command();
    program.parse(['electron', 'script2.js']);
    expect(program.name()).toEqual('script2');
  });
});