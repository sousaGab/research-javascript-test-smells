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

  renderAxis(Rickshaw.Graph.Axis.X, {
    graph,
    tickFormat: graph.x.tickFormat()
  });

  renderAxis(Rickshaw.Graph.Axis.Y, { graph });

  const getTextContents = (root, className) =>
    Array.from(root.getElementsByClassName(className)[0].getElementsByTagName('text')).map(
      (n) => n.innerHTML
    );

  const getTransforms = (root, className) =>
    Array.from(root.getElementsByClassName(className)[0].getElementsByTagName('g')).map((n) =>
      n.getAttribute('transform')
    );

  // Check x-axis ticks
  expect(graph.x.ticks()[0]).toBeInstanceOf(Date);
  const xTickTexts = getTextContents(element, 'x_ticks_d3');
  expect(xTickTexts[0]).toBe('Sep 29');
  expect(xTickTexts[1]).toBe('Oct 06');
  expect(xTickTexts[8]).toBe('Nov 24');

  // Check y-axis ticks
  const yTickTransforms = getTransforms(element, 'y_ticks');
  expect(yTickTransforms[0]).toBe('translate(0,500)');
  expect(yTickTransforms[1]).toBe('translate(0,275.24400874015976)');
  expect(yTickTransforms[2]).toBe('translate(0,182.14702893572516)');

  // Check scale independence
  scale.range([0, 960]);
  expect(scale.range()).toEqual(graph.x.range());
  scale.range([0, 1]);
  expect(scale.range()).not.toEqual(graph.x.range());
});