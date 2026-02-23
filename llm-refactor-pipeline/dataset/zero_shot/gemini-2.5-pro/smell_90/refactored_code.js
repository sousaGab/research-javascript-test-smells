it("uses default threshold of 3px when not specified (v2 API)", function () {
  const onDragStart = jest.fn();
  const DEFAULT_DRAG_THRESHOLD = 3;
  const startX = 50;
  const startY = 50;

  const { container } = render(
    <GridLayoutV2
      className="layout"
      gridConfig={{ cols: 12, rowHeight: 30 }}
      width={1200}
      layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
      dragConfig={{ enabled: true }}
      onDragStart={onDragStart}
    >
      <div key="a">a</div>
    </GridLayoutV2>
  );

  const gridItem = container.querySelector(".react-grid-item");

  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", {
      clientX: startX,
      clientY: startY
    });
  });

  act(() => {
    mouseMove(startX + DEFAULT_DRAG_THRESHOLD - 1, startY, gridItem);
  });
  expect(onDragStart).not.toHaveBeenCalled();

  act(() => {
    mouseMove(startX + DEFAULT_DRAG_THRESHOLD + 1, startY, gridItem);
  });
  expect(onDragStart).toHaveBeenCalled();

  act(() => {
    const finalX = startX + DEFAULT_DRAG_THRESHOLD + 1;
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: finalX,
      clientY: startY,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});