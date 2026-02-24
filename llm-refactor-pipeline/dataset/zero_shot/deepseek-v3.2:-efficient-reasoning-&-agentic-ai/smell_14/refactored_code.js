it('should update an node with static child and text', () => {
  const template = () =>
    createElement('div', null, createElement('div', null, 'Hello, World'));

  for (let i = 0; i < 3; i++) {
    render(template(), container);
    expect(container.firstChild.innerHTML).toBe('<div>Hello, World</div>');
  }
})