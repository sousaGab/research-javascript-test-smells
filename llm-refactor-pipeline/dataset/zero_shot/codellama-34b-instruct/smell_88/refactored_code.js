it("does not cause item to jump on drag start with default positionStrategy", function () {
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  // Create a grid with known position - item at grid position (0,0)
  const { container } = render(
    <GridLayoutV2
      className="layout"
      gridConfig={{ cols: 12, rowHeight: 30, margin: [10, 10] }}
      width={1200}
      layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
      dragConfig={{ enabled: true }}
      onDrag={onDrag}
      onDragStart={onDragStart}
    >
      <div key="a">a</div>
    </GridLayoutV2>
  );

  const gridItem = container.querySelector(".react-grid-item");
  const gridLayout = container.querySelector(".react-grid-layout");

  // Mock getBoundingClientRect to simulate the grid being at y=500 on the page
  const originalGetBoundingClientRect = gridLayout.getBoundingClientRect.bind(gridLayout);
  gridLayout.getBoundingClientRect = () => ({
    ...originalGetBoundingClientRect(),
    top: 500,
    left: 0,
    width: 1200,
    height: 600
  });

  // Also mock the grid item's getBoundingClientRect
  const originalItemGetBoundingClientRect = gridItem.getBoundingClientRect.bind(gridItem);
  gridItem.getBoundingClientRect = () => ({
    ...originalItemGetBoundingClientRect(),
    top: 510,
    left: 10,
    width: 190,
    height: 60
  });

  // Start drag - click at screen position (20, 520) which is inside the item
  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", {
      clientX: 20,
      clientY: 520
    });
  });

  // Move a small amount (just enough to trigger drag start)
  act(() => {
    mouseMove(25, 525, gridItem);
  });

  // onDragStart should have been called
  expect(onDragStart).toHaveBeenCalled();

  // Now move a bit more
  act(() => {
    mouseMove(30, 530, gridItem);
  });

  // Verify onDrag was called
  expect(onDrag).toHaveBeenCalled();

  // Get the last onDrag call arguments
  const dragCall = onDrag.mock.calls[onDrag.mock.calls.length - 1];
  const newItem = dragCall[2];

  // The key test: verify the item hasn't jumped to a position way off from
  // where it started. With the bug, calcDragPosition returns screen coordinates
  // (clientY - offsetY = 520 - 10 = 510), which would be converted to grid
  // position around y=12+ (510 / (30+10) = 12.75).
  //
  // Without the bug, the position is calculated parent-relative:
  // (520 - 500 - offsetY_within_item) ≈ 10-20 pixels, which is y=0 in grid.
  //
  // Allow some tolerance since the mouse moved a bit.
  expect(newItem.y).toBeLessThan(5);

  // Clean up
  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: 30,
      clientY: 530,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});