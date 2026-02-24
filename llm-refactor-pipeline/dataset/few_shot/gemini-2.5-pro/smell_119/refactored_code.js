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

  const customXScale = d3.time.scale();
  const graph = new Rickshaw.Graph({
    element: element,
    width: 960,
    height: 500,
    xScale: customXScale,
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

  expect(graph.x.ticks()[0]).toBeInstanceOf(Date);

  const xTickElements = element.querySelectorAll('.x_ticks_d3 text');
  expect(xTickElements[0].innerHTML).toBe('Sep 29');
  expect(xTickElements[1].innerHTML).toBe('Oct 06');
  expect(xTickElements[8].innerHTML).toBe('Nov 24');

  const yTickElements = element.querySelectorAll('.y_ticks g');
  const yTickTransforms = Array.from(yTickElements, el => el.getAttribute('transform'));
  expect(yTickTransforms.slice(0, 3)).toEqual([
    'translate(0,500)',
    'translate(0,275.24400874015976)',
    'translate(0,182.14702893572516)'
  ]);

  customXScale.range([0, 960]);
  expect(customXScale.range()).toEqual(graph.x.range());
  customXScale.range([0, 1]);
  expect(customXScale.range()).not.toEqual(graph.x.range());
});