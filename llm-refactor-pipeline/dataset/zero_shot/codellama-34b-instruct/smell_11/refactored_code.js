function assertTextContentAndChildNodesLength(container, expectedTextContent, expectedChildNodesLength) {
    expect(container.textContent).toBe(expectedTextContent);
    expect(container.firstChild.childNodes.length).toBe(expectedChildNodesLength);
}

it('should do a advanced shuffle - numbers and letters', () => {
    const container = document.createElement('div');
    const template = generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3]);

    render(template, container);
    assertTextContentAndChildNodesLength(container, 'abcd123', 7);

    render(template, container);
    assertTextContentAndChildNodesLength(container, '1e2bfgca3', 9);

    render(template, container);
    assertTextContentAndChildNodesLength(container, 'abcd123', 7);

    render(template, container);
    assertTextContentAndChildNodesLength(container, '0e2bfgca4', 9);

    render(template, container);
    assertTextContentAndChildNodesLength(container, 'abcd123', 7);

    render(template, container);
    assertTextContentAndChildNodesLength(container, '1e2bfgca3', 9);
});