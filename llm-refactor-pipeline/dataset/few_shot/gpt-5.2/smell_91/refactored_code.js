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

  const dragEnterAt = (x, y) =>
    act(() => {
      TestUtils.Simulate.dragEnter(grid, { clientX: x, clientY: y });
    });

  const dragOverAt = (x, y) =>
    act(() => {
      TestUtils.Simulate.dragOver(grid, {
        currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        clientX: x,
        clientY: y,
        nativeEvent: { target: document.createElement("div") }
      });
    });

  const dragLeaveAt = (x, y) =>
    act(() => {
      TestUtils.Simulate.dragLeave(grid, { clientX: x, clientY: y });
    });

  const hasDroppingElemInLayoutCalls = calls =>
    calls.some(call => call[0].some(item => item.i === "__dropping-elem__"));

  const getLastLayout = calls => calls[calls.length - 1]?.[0] || [];

  const countGridItems = () =>
    container.querySelectorAll(".react-grid-item").length;

  const getMaxUpdateDepthErrors = () =>
    consoleError.mock.calls.filter(call =>
      call[0]?.includes?.("Maximum update depth exceeded")
    );

  dragEnterAt(200, 100);
  dragOverAt(200, 100);

  expect(countGridItems()).toBeGreaterThanOrEqual(2);
  expect(hasDroppingElemInLayoutCalls(onLayoutChange.mock.calls)).toBe(false);

  for (let i = 0; i < 5; i++) dragOverAt(200 + i * 20, 100 + i * 20);

  dragLeaveAt(-100, -100);

  expect(countGridItems()).toBe(1);
  expect(
    getLastLayout(onLayoutChange.mock.calls).some(
      item => item.i === "__dropping-elem__"
    )
  ).toBe(false);

  expect(onDrag.mock.calls.length).toBeLessThan(50);
  expect(getMaxUpdateDepthErrors()).toHaveLength(0);

  consoleError.mockRestore();
});