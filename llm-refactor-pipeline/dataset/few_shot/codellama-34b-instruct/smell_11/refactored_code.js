it('should do a advanced shuffle - numbers and letters', () => {
    const nodes = generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3]);
    const template = (nodes) => {
        return `<div>${nodes.map((node) => `<span>${node}</span>`).join('')}</div>`;
    };
    const container = document.createElement('div');

    render(template(nodes), container);
    expect(container.textContent).toBe('abcd123');
    expect(container.firstChild.childNodes.length).toBe(7);

    nodes.push('e');
    nodes.push(2);
    nodes.push('b');
    nodes.push('f');
    nodes.push('g');
    nodes.push('c');
    nodes.push('a');
    nodes.push(3);
    render(template(nodes), container);
    expect(container.textContent).toBe('1e2bfgca3');
    expect(container.firstChild.childNodes.length).toBe(9);

    nodes.push(0);
    nodes.push('e');
    nodes.push(2);
    nodes.push('b');
    nodes.push('f');
    nodes.push('g');
    nodes.push('c');
    nodes.push('a');
    nodes.push(4);
    render(template(nodes), container);
    expect(container.textContent).toBe('0e2bfgca4');
    expect(container.firstChild.childNodes.length).toBe(11);

    nodes.push('a');
    nodes.push('b');
    nodes.push('c');
    nodes.push('d');
    nodes.push(1);
    nodes.push(2);
    nodes.push(3);
    render(template(nodes), container);
    expect(container.textContent).toBe('abcd123');
    expect(container.firstChild.childNodes.length).toBe(7);

    nodes.push(1);
    nodes.push('e');
    nodes.push(2);
    nodes.push('b');
    nodes.push('f');
    nodes.push('g');
    nodes.push('c');
    nodes.push('a');
    nodes.push(3);
    render(template(nodes), container);
    expect(container.textContent).toBe('1e2bfgca3');
    expect(container.firstChild.childNodes.length).toBe(9);
});