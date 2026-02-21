it("does not cause item to jump on drag start with default positionStrategy", function () {
  const gridLayout = new GridLayoutV2({
    className: "layout",
    gridConfig: { cols: 12, rowHeight: 30, margin: [10, 10] },
    width: 1200,
    layout: [{ i: "a", x: 0, y: 0, w: 2, h: 2 }],
    dragConfig: { enabled: true },
  });

  const gridItem = gridLayout.querySelector(".react-grid-item");
  const gridLayoutRect = gridLayout.getBoundingClientRect();
  const gridItemRect = gridItem.getBoundingClientRect();

  // Start drag - click at screen position (20, 520) which is inside the item
  // The item is at screen position (10, 510) to (200, 570)
  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", {
      clientX: 20,
      clientY: 520, // Screen Y position (500 grid offset + 20)
    });
  });

  // Move a small amount (just enough to trigger drag start)
  act(() => {
    mouseMove(25, 525, gridItem);
  });

  // onDragStart should have been called
  expect(gridLayout.onDragStart).toHaveBeenCalled();

  // Now move a bit more
  act(() => {
    mouseMove(30, 530, gridItem);
  });

  // Verify onDrag was called
  expect(gridLayout.onDrag).toHaveBeenCalled();

  // Get the last onDrag call arguments
  // onDrag signature: (layout, oldItem, newItem, placeholder, event, element)
  const dragCall = gridLayout.onDrag.mock.calls[gridLayout.onDrag.mock.calls.length - 1];
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
      button: 0,
    });
    document.dispatchEvent(mouseUpEvent);
  });
});