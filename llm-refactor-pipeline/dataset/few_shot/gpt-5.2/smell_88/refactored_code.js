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

  const MOUSE_DOWN = { x: 20, y: 520 };
  const MOVE_1 = { x: 25, y: 525 };
  const MOVE_2 = { x: 30, y: 530 };

  const { container } = render(
    <GridLayoutV2
      className="layout"
      gridConfig={{ cols: 12, rowHeight: 30, margin: [10, 10] }}
      width={GRID_WIDTH}
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

  const originalGridRect = gridLayout.getBoundingClientRect.bind(gridLayout);
  gridLayout.getBoundingClientRect = () => ({
    ...originalGridRect(),
    top: GRID_TOP,
    left: GRID_LEFT,
    width: GRID_WIDTH,
    height: GRID_HEIGHT
  });

  const originalItemRect = gridItem.getBoundingClientRect.bind(gridItem);
  gridItem.getBoundingClientRect = () => ({
    ...originalItemRect(),
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
    mouseMove(MOVE_1.x, MOVE_1.y, gridItem);
  });

  expect(onDragStart).toHaveBeenCalled();

  act(() => {
    mouseMove(MOVE_2.x, MOVE_2.y, gridItem);
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
      clientX: MOVE_2.x,
      clientY: MOVE_2.y,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});