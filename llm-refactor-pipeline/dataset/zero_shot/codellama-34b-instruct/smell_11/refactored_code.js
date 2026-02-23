// Your COMPLETE refactored test code here

it('should do a advanced shuffle - numbers and letters', () => {
    const generateKeyNodes = (keys) => {
        return keys.map((key) => {
            return {
                key,
                textContent: key.toString(),
                firstChild: {
                    childNodes: [],
                },
            };
        });
    };

    const template = (nodes) => {
        return nodes.map((node) => {
            return {
                key: node.key,
                textContent: node.textContent,
                firstChild: {
                    childNodes: node.firstChild.childNodes,
                },
            };
        });
    };

    const container = {
        textContent: '',
        firstChild: {
            childNodes: [],
        },
    };

    const shuffle = (array) => {
        const result = [];
        while (array.length > 0) {
            const index = Math.floor(Math.random() * array.length);
            result.push(array[index]);
            array.splice(index, 1);
        }
        return result;
    };

    const shuffledNodes = shuffle(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3]));
    const shuffledNodes2 = shuffle(generateKeyNodes([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3]));
    const shuffledNodes3 = shuffle(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3]));
    const shuffledNodes4 = shuffle(generateKeyNodes([0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4]));
    const shuffledNodes5 = shuffle(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3]));
    const shuffledNodes6 = shuffle(generateKeyNodes([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3]));

    render(template(shuffledNodes), container);
    expect(container.textContent).toBe('abcd123');
    expect(container.firstChild.childNodes.length).toBe(7);

    render(template(shuffledNodes2), container);
    expect(container.textContent).toBe('1e2bfgca3');
    expect(container.firstChild.childNodes.length).toBe(9);

    render(template(shuffledNodes3), container);
    expect(container.textContent).toBe('abcd123');
    expect(container.firstChild.childNodes.length).toBe(7);

    render(template(shuffledNodes4), container);
    expect(container.textContent).toBe('0e2bfgca4');
    expect(container.firstChild.childNodes.length).toBe(9);

    render(template(shuffledNodes5), container);
    expect(container.textContent).toBe('abcd123');
    expect(container.firstChild.childNodes.length).toBe(7);

    render(template(shuffledNodes6), container);
    expect(container.textContent).toBe('1e2bfgca3');
    expect(container.firstChild.childNodes.length).toBe(9);
});