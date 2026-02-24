test('handles custom d3 scales', () => {
  const element = document.createElement('div');
  document.body.appendChild(element);

  const times = [1380000000000, 1390000000000];
  const series = [{
    color: 'steelblue',
    data: [
      { x: times[0], y: 40 },
      { x: times[1], y: 49 }
    ]
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

  const xAxis = new Rickshaw.Graph.Axis.X({
    graph: graph,
    tickFormat: graph.x.tickFormat()
  });
  xAxis.render();

  const yAxis = new Rickshaw.Graph.Axis.Y({
    graph: graph
  });
  yAxis.render();

  const xTicks = element.getElementsByClassName('x_ticks_d3')[0].getElementsByTagName('text');
  const yTicks = element.getElementsByClassName('y_ticks')[0].getElementsByTagName('g');

  expect(graph.x.ticks()[0]).toBeInstanceOf(Date);
  expect(xTicks[0].innerHTML).toBe('Sep 29');
  expect(xTicks[1].innerHTML).toBe('Oct 06');
  expect(xTicks[8].innerHTML).toBe('Nov 24');
  expect(yTicks[0].getAttribute('transform')).toBe('translate(0,500)');
  expect(yTicks[1].getAttribute('transform')).toBe('translate(0,275.24400874015976)');
  expect(yTicks[2].getAttribute('transform')).toBe('translate(0,182.14702893572516)');
  
  scale.range([0, 960]);
  expect(scale.range()).toEqual(graph.x.range());
  scale.range([0, 1]);
  expect(scale.range()).not.toEqual(graph.x.range());
});