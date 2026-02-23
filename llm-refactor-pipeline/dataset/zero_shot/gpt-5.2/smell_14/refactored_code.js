it('should update an node with static child and text', () => {
  const template = () =>
    createElement('div', null, createElement('div', null, 'Hello, World'));

  const expectedHTML = '<div>Hello, World</div>';

  render(template(), container);
  render(template(), container);
  render(template(), container);

  expect(container.firstChild.innerHTML).toBe(expectedHTML);
});