it("'cde' => [ div ]", () => {
  const container = document.createElement('div');
  const element = createElement('div', null, createElement('div', null));

  render(element, container);

  expect(container.innerHTML).toBe('<div><div></div></div>');
});