it("does not cause item to jump on drag start with default positionStrategy", function () {
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  const gridTopOffset = 500;
  const initialLayout = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];
  const gridConfig = { cols: 12, rowHeight: 30, margin: [10, 10] };

  const { container } = render(
    <GridLayoutV2
      className="layout"
      gridConfig={gridConfig}
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

  const originalGetBoundingClientRect = gridLayout.getBoundingClientRect.bind(gridLayout);
  gridLayout.getBoundingClientRect = () => ({
    ...originalGetBoundingClientRect(),
    top: gridTopOffset,
    left: 0,
    width: 1200,
    height: 600
  });

  const originalItemGetBoundingClientRect = gridItem.getBoundingClientRect.bind(gridItem);
  gridItem.getBoundingClientRect = () => ({
    ...originalItemGetBoundingClientRect(),
    top: gridTopOffset + gridConfig.margin[1],
    left: gridConfig.margin[0],
    width: 190,
    height: 60
  });

  const dragStartPoint = { clientX: 20, clientY: gridTopOffset + 20 };
  const dragMovePoint1 = { clientX: 25, clientY: gridTopOffset + 25 };
  const dragMovePoint2 = { clientX: 30, clientY: gridTopOffset + 30 };

  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", dragStartPoint);
  });

  act(() => {
    mouseMove(dragMovePoint1.clientX, dragMovePoint1.clientY, gridItem);
  });
  expect(onDragStart).toHaveBeenCalled();

  act(() => {
    mouseMove(dragMovePoint2.clientX, dragMovePoint2.clientY, gridItem);
  });
  expect(onDrag).toHaveBeenCalled();

  const lastOnDragCallArgs = onDrag.mock.calls[onDrag.mock.calls.length - 1];
  const draggedItem = lastOnDragCallArgs[2];
  const expectedYPosition = initialLayout[0].y;

  expect(draggedItem.y).toBe(expectedYPosition);

  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: dragMovePoint2.clientX,
      clientY: dragMovePoint2.clientY,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});