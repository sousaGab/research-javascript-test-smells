it('should do advanced shuffle - numbers and letters', () => {
  // Test case 1: Initial render with letters and numbers
  render(
    template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])),
    container,
  );
  expect(container.textContent).toBe('abcd123');
  expect(container.firstChild.childNodes.length).toBe(7);

  // Test case 2: Mixed order with letters and numbers
  render(
    template(generateKeyNodes([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3])),
    container,
  );
  expect(container.textContent).toBe('1e2bfgca3');
  expect(container.firstChild.childNodes.length).toBe(9);

  // Test case 3: Re-render with original data
  render(
    template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])),
    container,
  );
  expect(container.textContent).toBe('abcd123');
  expect(container.firstChild.childNodes.length).toBe(7);

  // Test case 4: Different mixed order
  render(
    template(generateKeyNodes([0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4])),
    container,
  );
  expect(container.textContent).toBe('0e2bfgca4');
  expect(container.firstChild.childNodes.length).toBe(9);

  // Test case 5: Final re-render with original data
  render(
    template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])),
    container,
  );
  expect(container.textContent).toBe('abcd123');
  expect(container.firstChild.childNodes.length).toBe(7);

  // Test case 6: Final mixed order
  render(
    template(generateKeyNodes([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3])),
    container,
  );
  expect(container.textContent).toBe('1e2bfgca3');
  expect(container.firstChild.childNodes.length).toBe(9);
});