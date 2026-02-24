it('should update a node with static child and text', () => {
  const template = () =>
    createElement('div', null, createElement('div', null, 'Hello, World'));

  render(template(), container);
  expect(container.firstChild.innerHTML).toBe('<div>Hello, World</div>');
})