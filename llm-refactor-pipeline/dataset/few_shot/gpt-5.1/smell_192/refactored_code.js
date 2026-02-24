test('when parse with implied program name then name matches script', () => {
  const program1 = new commander.Command();
  program1.parse(['node', 'script1.js']);
  expect(program1.name()).toEqual('script1');
});

test('when parse with different implied program name then name changes', () => {
  const program2 = new commander.Command();
  program2.parse(['electron', 'script2.js']);
  expect(program2.name()).toEqual('script2');
});