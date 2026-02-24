it("does not cause item to jump on drag start with default positionStrategy", function () {
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  const GRID_TOP_OFFSET = 500;
  const initialLayout = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];

  const { container } = render(
    <GridLayoutV2
      className="layout"
      gridConfig={{ cols: 12, rowHeight: 30, margin: [10, 10] }}
      width={1200}
      layout={initialLayout}
      dragConfig={{ enabled: true }}
      onDrag={onDrag}
      onDragStart={onDragStart}
    >
      <div key="a">a</div>
    </GridLayoutV2>
  );

  const gridItem = container.querySelector(".react-grid-item");
  const gridLayout = container.querySelector(".react-grid-layout");

  // Mock getBoundingClientRect to simulate the grid being offset from the top
  // of the page. This is crucial to reproduce the bug where item position was
  // calculated relative to the screen instead of the grid.
  gridLayout.getBoundingClientRect = () => ({
    top: GRID_TOP_OFFSET,
    left: 0,
    width: 1200,
    height: 600,
    right: 1200,
    bottom: 600 + GRID_TOP_OFFSET,
    x: 0,
    y: GRID_TOP_OFFSET
  });

  // The item is at (10, 10) relative to the grid.
  gridItem.getBoundingClientRect = () => ({
    top: GRID_TOP_OFFSET + 10,
    left: 10,
    width: 190,
    height: 60,
    right: 200,
    bottom: GRID_TOP_OFFSET + 70,
    x: 10,
    y: GRID_TOP_OFFSET + 10
  });

  const mouseDownY = GRID_TOP_OFFSET + 20;
  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", {
      clientX: 20,
      clientY: mouseDownY
    });
  });

  act(() => {
    mouseMove(25, mouseDownY + 5, gridItem);
  });
  expect(onDragStart).toHaveBeenCalled();

  act(() => {
    mouseMove(30, mouseDownY + 10, gridItem);
  });
  expect(onDrag).toHaveBeenCalled();

  const lastOnDragCall = onDrag.mock.calls.at(-1);
  const newItem = lastOnDragCall[2];

  // The item's y position should remain close to its original grid position (y=0).
  // A bug would cause it to jump to a high y value by incorrectly using
  // screen coordinates for position calculation.
  expect(newItem.y).toBeLessThan(2);

  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: 30,
      clientY: mouseDownY + 10,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});