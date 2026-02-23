it("does not cause Maximum update depth exceeded when dragging in then out (#2210)", function () {
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  const onLayoutChange = jest.fn();
  const onDropDragOver = jest.fn(() => ({ w: 2, h: 2 }));
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  const { container } = render(
    <ReactGridLayout
      className="layout"
      cols={12}
      rowHeight={30}
      width={1200}
      isDroppable={true}
      onDropDragOver={onDropDragOver}
      onLayoutChange={onLayoutChange}
      onDrag={onDrag}
      onDragStart={onDragStart}
    >
      <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
        a
      </div>
    </ReactGridLayout>
  );

  const grid = container.querySelector(".react-grid-layout");

  const dragEnterGrid = (x, y) =>
    act(() => {
      TestUtils.Simulate.dragEnter(grid, { clientX: x, clientY: y });
    });

  const dragOverGrid = (x, y) =>
    act(() => {
      TestUtils.Simulate.dragOver(grid, {
        currentTarget: {
          getBoundingClientRect: () => ({ left: 0, top: 0 })
        },
        clientX: x,
        clientY: y,
        nativeEvent: { target: document.createElement("div") }
      });
    });

  const dragLeaveGrid = (x, y) =>
    act(() => {
      TestUtils.Simulate.dragLeave(grid, { clientX: x, clientY: y });
    });

  const publicLayoutIncludesDroppingElem = () =>
    onLayoutChange.mock.calls.some(([layout]) =>
      (layout || []).some(item => item.i === "__dropping-elem__")
    );

  const lastPublicLayoutIncludesDroppingElem = () => {
    const calls = onLayoutChange.mock.calls;
    const lastLayout = calls[calls.length - 1]?.[0] || [];
    return lastLayout.some(item => item.i === "__dropping-elem__");
  };

  const maxUpdateDepthErrors = () =>
    consoleError.mock.calls.filter(call =>
      call[0]?.includes?.("Maximum update depth exceeded")
    );

  dragEnterGrid(200, 100);
  dragOverGrid(200, 100);

  expect(container.querySelectorAll(".react-grid-item").length).toBeGreaterThanOrEqual(
    2
  );
  expect(publicLayoutIncludesDroppingElem()).toBe(false);

  for (let i = 0; i < 5; i++) dragOverGrid(200 + i * 20, 100 + i * 20);

  dragLeaveGrid(-100, -100);

  expect(container.querySelectorAll(".react-grid-item").length).toBe(1);
  expect(lastPublicLayoutIncludesDroppingElem()).toBe(false);

  expect(onDrag.mock.calls.length).toBeLessThan(50);
  expect(maxUpdateDepthErrors()).toHaveLength(0);

  consoleError.mockRestore();
});