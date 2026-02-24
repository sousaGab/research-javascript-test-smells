test('handles custom d3 scales', () => {
  const createGraphElement = () => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    return element;
  };

  const createSeries = (times) => ([
    {
      color: 'steelblue',
      data: [
        { x: times[0], y: 40 },
        { x: times[1], y: 49 }
      ]
    }
  ]);

  const createGraph = ({ element, xScale, series }) =>
    new Rickshaw.Graph({
      element,
      width: 960,
      height: 500,
      xScale,
      yScale: d3.scale.sqrt(),
      series
    });

  const renderAxes = (graph) => {
    const xAxis = new Rickshaw.Graph.Axis.X({
      graph,
      tickFormat: graph.x.tickFormat()
    });
    xAxis.render();

    const yAxis = new Rickshaw.Graph.Axis.Y({ graph });
    yAxis.render();
  };

  const assertXAxisTicks = (graph, element) => {
    expect(graph.x.ticks()[0]).toBeInstanceOf(Date);

    const xTicks = element
      .getElementsByClassName('x_ticks_d3')[0]
      .getElementsByTagName('text');

    const expectedXTicks = ['Sep 29', 'Oct 06', 'Nov 24'];
    [0, 1, 8].forEach((index, i) => {
      expect(xTicks[index].innerHTML).toBe(expectedXTicks[i]);
    });
  };

  const assertYAxisTicks = (element) => {
    const yTicks = element
      .getElementsByClassName('y_ticks')[0]
      .getElementsByTagName('g');

    const expectedTransforms = [
      'translate(0,500)',
      'translate(0,275.24400874015976)',
      'translate(0,182.14702893572516)'
    ];

    expectedTransforms.forEach((transform, index) => {
      expect(yTicks[index].getAttribute('transform')).toBe(transform);
    });
  };

  const assertScaleIndependence = (scale, graph) => {
    scale.range([0, 960]);
    expect(scale.range()).toEqual(graph.x.range());

    scale.range([0, 1]);
    expect(scale.range()).not.toEqual(graph.x.range());
  };

  const element = createGraphElement();
  const times = [1380000000000, 1390000000000];
  const series = createSeries(times);
  const scale = d3.time.scale();

  const graph = createGraph({ element, xScale: scale, series });
  graph.render();
  renderAxes(graph);

  assertXAxisTicks(graph, element);
  assertYAxisTicks(element);
  assertScaleIndependence(scale, graph);
});