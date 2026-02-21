Refactored Test Code:
it('should move a key with a size up', () => {
    const nodes = generateNodes(['a', '#1', '#2', '#3']);
    const template = (nodes) => `
      <div>
        ${nodes.map((node) => `<div>${node}</div>`).join('')}
      </div>
    `;
    const container = document.createElement('div');

    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#4');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#5');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#6');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#7');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#8');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#9');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#10');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#11');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#12');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#13');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#14');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#15');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#16');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#17');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#18');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#19');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#20');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#21');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#22');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#23');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#24');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#25');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#26');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#27');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#28');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#29');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#30');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#31');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#32');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#33');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#34');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#35');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#36');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#37');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#38');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#39');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#40');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#41');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#42');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#43');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#44');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#45');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#46');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#47');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#48');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#49');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#50');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#51');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#52');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#53');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#54');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#55');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#56');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#57');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#58');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#59');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#60');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#61');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#62');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#63');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#64');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#65');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#66');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);

    nodes.push('#67');
    render(template(nodes), container);
    expect(container.textContent).toBe('#0#1#2#3a#