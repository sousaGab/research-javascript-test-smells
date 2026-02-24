describe('program name inference', () => {
  test('should infer program name from node script argument', () => {
    const program = new commander.Command();
    program.parse(['node', 'script1.js']);
    expect(program.name()).toEqual('script1');
  });

  test('should infer program name from electron script argument', () => {
    const program = new commander.Command();
    program.parse(['electron', 'script2.js']);
    expect(program.name()).toEqual('script2');
  });
});