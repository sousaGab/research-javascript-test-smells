it("does not cause Maximum update depth exceeded with v2 API GridLayout (#2210)", function () {
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
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

  const createDragOverEvent = ({ clientX, clientY }) => ({
    currentTarget: {
      getBoundingClientRect: () => ({ left: 0, top: 0 })
    },
    clientX,
    clientY,
    nativeEvent: {
      target: document.createElement("div")
    }
  });

  const simulate = (type, event) => {
    act(() => {
      TestUtils.Simulate[type](grid, event);
    });
  };

  // Step 1: Drag into the grid (creates dropping placeholder)
  simulate("dragEnter", { clientX: 200, clientY: 100 });
  simulate("dragOver", createDragOverEvent({ clientX: 200, clientY: 100 }));

  // Step 2: Move around inside multiple times
  Array.from({ length: 5 }, (_, i) => i).forEach(i => {
    simulate(
      "dragOver",
      createDragOverEvent({ clientX: 200 + i * 30, clientY: 100 + i * 30 })
    );
  });

  // Step 3: Drag out
  simulate("dragLeave", { clientX: -100, clientY: -100 });

  const maxDepthErrors = consoleError.mock.calls.filter(call =>
    call[0]?.includes?.("Maximum update depth exceeded")
  );
  expect(maxDepthErrors).toHaveLength(0);

  consoleError.mockRestore();
});