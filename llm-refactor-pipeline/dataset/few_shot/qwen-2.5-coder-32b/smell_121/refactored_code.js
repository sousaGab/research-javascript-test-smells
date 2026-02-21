it("does not cause Maximum update depth exceeded with v2 API GridLayout (#2210)", function () {
  const consoleError = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});
  const onLayoutChange = jest.fn();
  const onDragOver = jest.fn(() => ({ w: 2, h: 2 }));
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  const { container } = render(
    <GridLayoutV2
      className="layout"
      gridConfig={{ cols: 12, rowHeight: 30 }}
      width={1200}
      layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
      dropConfig={{ enabled: true, onDragOver }}
      onLayoutChange={onLayoutChange}
      onDrag={onDrag}
      onDragStart={onDragStart}
    >
      <div key="a">a</div>
    </GridLayoutV2>
  );

  const grid = container.querySelector(".react-grid-layout");

  // Helper to create drag event
  const createDragEvent = (clientX, clientY) => ({
    currentTarget: {
      getBoundingClientRect: () => ({ left: 0, top: 0 })
    },
    clientX,
    clientY,
    nativeEvent: {
      target: document.createElement("div")
    }
  });

  // Step 1: Drag into the grid (creates dropping placeholder)
  act(() => {
    TestUtils.Simulate.dragEnter(grid, {
      clientX: 200,
      clientY: 100
    });
  });

  act(() => {
    TestUtils.Simulate.dragOver(grid, createDragEvent(200, 100));
  });

  // Step 2: Move around inside multiple times
  for (let i = 0; i < 5; i++) {
    act(() => {
      TestUtils.Simulate.dragOver(grid, createDragEvent(200 + i * 30, 100 + i * 30));
    });
  }

  // Step 3: Drag out
  act(() => {
    TestUtils.Simulate.dragLeave(grid, {
      clientX: -100,
      clientY: -100
    });
  });

  // Verify no "Maximum update depth exceeded" errors
  const maxDepthErrors = consoleError.mock.calls.filter(call =>
    call[0]?.includes?.("Maximum update depth exceeded")
  );
  expect(maxDepthErrors).toHaveLength(0);

  consoleError.mockRestore();
});