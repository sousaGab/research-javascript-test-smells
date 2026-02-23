test('handles custom d3 scales', () => {
  const element = document.createElement('div');
  document.body.appendChild(element);

  const times = [1380000000000, 1390000000000];
  const series = [{
    color: 'steelblue',
    data: [{
      x: times[0],
      y: 40
    }, {
      x: times[1],
      y: 49
    }]
  }];

  const scale = d3.time.scale();
  const graph = new Rickshaw.Graph({
    element: element,
    width: 960,
    height: 500,
    xScale: scale,
    yScale: d3.scale.sqrt(),
    series: series
  });

  graph.render();

  new Rickshaw.Graph.Axis.X({
    graph: graph,
    tickFormat: graph.x.tickFormat()
  }).render();

  new Rickshaw.Graph.Axis.Y({
    graph: graph
  }).render();

  // Check x-axis ticks
  expect(graph.x.ticks()[0]).toBeInstanceOf(Date);
  const xTickLabels = Array.from(element.querySelectorAll('.x_ticks_d3 text'), el => el.innerHTML);
  expect(xTickLabels[0]).toBe('Sep 29');
  expect(xTickLabels[1]).toBe('Oct 06');
  expect(xTickLabels[8]).toBe('Nov 24');

  // Check y-axis ticks
  const yTickTransforms = Array.from(
    element.querySelectorAll('.y_ticks g'),
    el => el.getAttribute('transform')
  );
  expect(yTickTransforms.slice(0, 3)).toEqual([
    'translate(0,500)',
    'translate(0,275.24400874015976)',
    'translate(0,182.14702893572516)'
  ]);

  // Check scale independence
  scale.range([0, 960]);
  expect(scale.range()).toEqual(graph.x.range());
  scale.range([0, 1]);
  expect(scale.range()).not.toEqual(graph.x.range());
});