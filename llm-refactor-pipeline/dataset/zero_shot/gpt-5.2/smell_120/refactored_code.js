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
  const MOUSE_MOVE_1 = { x: 25, y: 525 };
  const MOUSE_MOVE_2 = { x: 30, y: 530 };

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

  const mockRect = (el, rect) => {
    const original = el.getBoundingClientRect.bind(el);
    el.getBoundingClientRect = () => ({ ...original(), ...rect });
  };

  mockRect(gridLayout, {
    top: GRID_TOP,
    left: GRID_LEFT,
    width: GRID_WIDTH,
    height: GRID_HEIGHT
  });

  mockRect(gridItem, {
    top: ITEM_TOP,
    left: ITEM_LEFT,
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT
  });

  const dragFromTo = (from, to1, to2) => {
    act(() => {
      dispatchMouseEvent(gridItem, "mousedown", { clientX: from.x, clientY: from.y });
    });

    act(() => {
      mouseMove(to1.x, to1.y, gridItem);
    });

    act(() => {
      mouseMove(to2.x, to2.y, gridItem);
    });
  };

  dragFromTo(MOUSE_DOWN, MOUSE_MOVE_1, MOUSE_MOVE_2);

  expect(onDragStart).toHaveBeenCalled();
  expect(onDrag).toHaveBeenCalled();

  const lastDragCall = onDrag.mock.calls[onDrag.mock.calls.length - 1];
  const newItem = lastDragCall[2];
  expect(newItem.y).toBeLessThan(5);

  act(() => {
    document.dispatchEvent(
      new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: MOUSE_MOVE_2.x,
        clientY: MOUSE_MOVE_2.y,
        button: 0
      })
    );
  });
});