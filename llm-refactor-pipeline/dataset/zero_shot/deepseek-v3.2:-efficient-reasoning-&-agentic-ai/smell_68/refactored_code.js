it('should render and re-render with key nodes correctly', () => {
    const initialKeys = [0, 1, 2, 3, 4, 5];
    const updatedKeys = [4, 3, 2, 1, 5, 0];

    render(template(generateKeyNodes(initialKeys)), container);
    expect(container.firstChild.childNodes.length).toBe(6);

    render(template(generateKeyNodes(updatedKeys)), container);
    expect(container.textContent).toBe('432150');
    expect(container.firstChild.childNodes.length).toBe(6);
});