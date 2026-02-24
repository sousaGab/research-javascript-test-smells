it('should update an node with static child and text', () => {
  const template = () =>
    createElement('div', null, createElement('div', null, 'Hello, World'));

  const expectedHtml = '<div>Hello, World</div>';

  render(template(), container);
  expect(container.firstChild.innerHTML).toBe(expectedHtml);

  render(template(), container);
  expect(container.firstChild.innerHTML).toBe(expectedHtml);

  render(template(), container);
  expect(container.firstChild.innerHTML).toBe(expectedHtml);
})