test('handles custom d3 scales', () => {
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

  const renderAxis = (AxisCtor, options) => {
    const axis = new AxisCtor(options);
    axis.render();
    return axis;
  };

  renderAxis(Rickshaw.Graph.Axis.X, { graph, tickFormat: graph.x.tickFormat() });
  renderAxis(Rickshaw.Graph.Axis.Y, { graph });

  const getTexts = (className) =>
    Array.from(element.getElementsByClassName(className)[0].getElementsByTagName('text'));

  const getGs = (className) =>
    Array.from(element.getElementsByClassName(className)[0].getElementsByTagName('g'));

  const expectTextAt = (texts, index, expected) => {
    expect(texts[index].innerHTML).toBe(expected);
  };

  const expectTransformAt = (nodes, index, expected) => {
    expect(nodes[index].getAttribute('transform')).toBe(expected);
  };

  // Check x-axis ticks
  expect(graph.x.ticks()[0]).toBeInstanceOf(Date);
  const xTicks = getTexts('x_ticks_d3');
  [
    [0, 'Sep 29'],
    [1, 'Oct 06'],
    [8, 'Nov 24']
  ].forEach(([index, expected]) => expectTextAt(xTicks, index, expected));

  // Check y-axis ticks
  const yTicks = getGs('y_ticks');
  [
    [0, 'translate(0,500)'],
    [1, 'translate(0,275.24400874015976)'],
    [2, 'translate(0,182.14702893572516)']
  ].forEach(([index, expected]) => expectTransformAt(yTicks, index, expected));

  // Check scale independence
  scale.range([0, 960]);
  expect(scale.range()).toEqual(graph.x.range());
  scale.range([0, 1]);
  expect(scale.range()).not.toEqual(graph.x.range());
});