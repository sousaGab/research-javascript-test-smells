test('handles custom d3 scales', () => {
  const createGraphFixture = () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const times = [1380000000000, 1390000000000];
    const series = [
      {
        color: 'steelblue',
        data: [
          { x: times[0], y: 40 },
          { x: times[1], y: 49 }
        ]
      }
    ];

    const scale = d3.time.scale();
    const graph = new Rickshaw.Graph({
      element,
      width: 960,
      height: 500,
      xScale: scale,
      yScale: d3.scale.sqrt(),
      series
    });

    graph.render();

    new Rickshaw.Graph.Axis.X({
      graph,
      tickFormat: graph.x.tickFormat()
    }).render();

    new Rickshaw.Graph.Axis.Y({ graph }).render();

    return { element, graph, scale };
  };

  const getTextNodes = (root, className) =>
    root.getElementsByClassName(className)[0].getElementsByTagName('text');

  const getGroupNodes = (root, className) =>
    root.getElementsByClassName(className)[0].getElementsByTagName('g');

  const expectTextsAt = (nodes, expectations) => {
    expectations.forEach(([index, text]) => {
      expect(nodes[index].innerHTML).toBe(text);
    });
  };

  const expectTransformsAt = (nodes, expectations) => {
    expectations.forEach(([index, transform]) => {
      expect(nodes[index].getAttribute('transform')).toBe(transform);
    });
  };

  const { element, graph, scale } = createGraphFixture();

  // Check x-axis ticks
  expect(graph.x.ticks()[0]).toBeInstanceOf(Date);
  const xTicks = getTextNodes(element, 'x_ticks_d3');
  expectTextsAt(xTicks, [
    [0, 'Sep 29'],
    [1, 'Oct 06'],
    [8, 'Nov 24']
  ]);

  // Check y-axis ticks
  const yTicks = getGroupNodes(element, 'y_ticks');
  expectTransformsAt(yTicks, [
    [0, 'translate(0,500)'],
    [1, 'translate(0,275.24400874015976)'],
    [2, 'translate(0,182.14702893572516)']
  ]);

  // Check scale independence
  scale.range([0, 960]);
  expect(scale.range()).toEqual(graph.x.range());
  scale.range([0, 1]);
  expect(scale.range()).not.toEqual(graph.x.range());
});