it("does not cause item to jump on drag start with default positionStrategy", function () {
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  // Create a grid with known position - item at grid position (0,0)
  // With width=1200, cols=12, rowHeight=30, margin=[10,10]
  // Item w=2, h=2 should be at pixel position (10, 10) with size 190x60
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
  // This is crucial - in jsdom, getBoundingClientRect returns zeros, so
  // the bug wouldn't manifest. In real browsers, the grid could be anywhere
  // on the page, and the bug would cause items to jump to screen position.
  const originalGetBoundingClientRect =
    gridLayout.getBoundingClientRect.bind(gridLayout);
  gridLayout.getBoundingClientRect = () => ({
    ...originalGetBoundingClientRect(),
    top: 500, // Simulate grid is 500px from top of page
    left: 0,
    width: 1200,
    height: 600
  });

  // Also mock the grid item's getBoundingClientRect
  const originalItemGetBoundingClientRect =
    gridItem.getBoundingClientRect.bind(gridItem);
  gridItem.getBoundingClientRect = () => ({
    ...originalItemGetBoundingClientRect(),
    top: 510, // Item is at y=10 relative to grid, so 500+10=510 on page
    left: 10,
    width: 190,
    height: 60
  });

  // Start drag - click at screen position (20, 520) which is inside the item
  // The item is at screen position (10, 510) to (200, 570)
  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", {
      clientX: 20,
      clientY: 520 // Screen Y position (500 grid offset + 20)
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
  // onDrag signature: (layout, oldItem, newItem, placeholder, event, element)
  const dragCall = onDrag.mock.calls[onDrag.mock.calls.length - 1];
  const newItem = dragCall[2]; // The item being dragged

  // The key test: verify the item hasn't jumped to a position way off from
  // where it started. With the bug, calcDragPosition returns screen coordinates
  // (clientY - offsetY = 520 - 10 = 510), which would be converted to grid
  // position around y=12+ (510 / (30+10) = 12.75).
  //
  // Without the bug, the position is calculated parent-relative:
  // (520 - 500 - offsetY_within_item) ≈ 10-20 pixels, which is y=0 in grid.
  //
  // Allow some tolerance since the mouse moved a bit.
  expect(newItem.y).toBeLessThan(5); // Should be near top (y=0-1), not jumped to y=12+

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