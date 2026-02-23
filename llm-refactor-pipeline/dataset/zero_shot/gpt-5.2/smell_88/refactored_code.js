it("does not cause item to jump on drag start with default positionStrategy", function () {
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  const GRID_TOP = 500;
  const GRID_LEFT = 0;
  const GRID_WIDTH = 1200;
  const GRID_HEIGHT = 600;

  const ITEM_TOP = GRID_TOP + 10;
  const ITEM_LEFT = 10;
  const ITEM_WIDTH = 190;
  const ITEM_HEIGHT = 60;

  const MOUSE_DOWN = { x: 20, y: GRID_TOP + 20 };
  const MOUSE_MOVE_1 = { x: 25, y: GRID_TOP + 25 };
  const MOUSE_MOVE_2 = { x: 30, y: GRID_TOP + 30 };

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

  const originalGetBoundingClientRect =
    gridLayout.getBoundingClientRect.bind(gridLayout);
  gridLayout.getBoundingClientRect = () => ({
    ...originalGetBoundingClientRect(),
    top: GRID_TOP,
    left: GRID_LEFT,
    width: GRID_WIDTH,
    height: GRID_HEIGHT
  });

  const originalItemGetBoundingClientRect =
    gridItem.getBoundingClientRect.bind(gridItem);
  gridItem.getBoundingClientRect = () => ({
    ...originalItemGetBoundingClientRect(),
    top: ITEM_TOP,
    left: ITEM_LEFT,
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT
  });

  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", {
      clientX: MOUSE_DOWN.x,
      clientY: MOUSE_DOWN.y
    });
  });

  act(() => {
    mouseMove(MOUSE_MOVE_1.x, MOUSE_MOVE_1.y, gridItem);
  });

  expect(onDragStart).toHaveBeenCalled();

  act(() => {
    mouseMove(MOUSE_MOVE_2.x, MOUSE_MOVE_2.y, gridItem);
  });

  expect(onDrag).toHaveBeenCalled();

  const dragCall = onDrag.mock.calls[onDrag.mock.calls.length - 1];
  const newItem = dragCall[2];

  expect(newItem.y).toBeLessThan(5);

  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: MOUSE_MOVE_2.x,
      clientY: MOUSE_MOVE_2.y,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});