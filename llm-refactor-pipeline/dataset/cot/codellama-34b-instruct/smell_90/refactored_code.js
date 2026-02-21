// Mousedown
act(() => {
  dispatchMouseEvent(gridItem, "mousedown", {
    clientX: 50,
    clientY: 50
  });
});

// Move only 2px (less than default threshold of 3)
act(() => {
  mouseMove(52, 50, gridItem);
});

// onDragStart should NOT have been called yet
expect(onDragStart).not.toHaveBeenCalled();

// Move another 2px (total 4px, exceeds default threshold of 3)
act(() => {
  mouseMove(54, 50, gridItem);
});

// NOW onDragStart should have been called
expect(onDragStart).toHaveBeenCalled();

// Clean up
act(() => {
  const mouseUpEvent = new MouseEvent("mouseup", {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: 54,
    clientY: 50,
    button: 0
  });
  document.dispatchEvent(mouseUpEvent);
});