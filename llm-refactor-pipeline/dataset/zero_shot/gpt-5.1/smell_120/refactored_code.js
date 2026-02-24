it("does not cause item to jump on drag start with default positionStrategy", function () {
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  const GRID_CONFIG = { cols: 12, rowHeight: 30, margin: [10, 10] };
  const GRID_WIDTH = 1200;
  const GRID_LAYOUT = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];
  const GRID_TOP = 500;
  const GRID_LEFT = 0;
  const GRID_HEIGHT = 600;

  const ITEM_TOP = 510;
  const ITEM_LEFT = 10;
  const ITEM_WIDTH = 190;
  const ITEM_HEIGHT = 60;

  const DRAG_START_CLIENT_X = 20;
  const DRAG_START_CLIENT_Y = 520;
  const FIRST_MOVE_CLIENT_X = 25;
  const FIRST_MOVE_CLIENT_Y = 525;
  const SECOND_MOVE_CLIENT_X = 30;
  const SECOND_MOVE_CLIENT_Y = 530;
  const MAX_ALLOWED_Y_POSITION = 5;

  const { container } = render(
    <GridLayoutV2
      className="layout"
      gridConfig={GRID_CONFIG}
      width={GRID_WIDTH}
      layout={GRID_LAYOUT}
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
      clientX: DRAG_START_CLIENT_X,
      clientY: DRAG_START_CLIENT_Y
    });
  });

  act(() => {
    mouseMove(FIRST_MOVE_CLIENT_X, FIRST_MOVE_CLIENT_Y, gridItem);
  });

  expect(onDragStart).toHaveBeenCalled();

  act(() => {
    mouseMove(SECOND_MOVE_CLIENT_X, SECOND_MOVE_CLIENT_Y, gridItem);
  });

  expect(onDrag).toHaveBeenCalled();

  const dragCall = onDrag.mock.calls[onDrag.mock.calls.length - 1];
  const newItem = dragCall[2];

  expect(newItem.y).toBeLessThan(MAX_ALLOWED_Y_POSITION);

  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: SECOND_MOVE_CLIENT_X,
      clientY: SECOND_MOVE_CLIENT_Y,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});