it("does not cause item to jump on drag start with default positionStrategy", function () {
  const onDrag = jest.fn();
  const onDragStart = jest.fn();

  const renderGrid = () =>
    render(
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

  const getGridElements = (container) => {
    const gridItem = container.querySelector(".react-grid-item");
    const gridLayout = container.querySelector(".react-grid-layout");
    return { gridItem, gridLayout };
  };

  const mockRect = (el, rect) => {
    const original = el.getBoundingClientRect.bind(el);
    el.getBoundingClientRect = () => ({ ...original(), ...rect });
  };

  const startDragAt = (el, { x, y }) => {
    act(() => {
      dispatchMouseEvent(el, "mousedown", { clientX: x, clientY: y });
    });
  };

  const moveMouseTo = (x, y, el) => {
    act(() => {
      mouseMove(x, y, el);
    });
  };

  const endDragAt = (x, y) => {
    act(() => {
      document.dispatchEvent(
        new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: x,
          clientY: y,
          button: 0
        })
      );
    });
  };

  const lastDragNewItem = () => {
    const lastCall = onDrag.mock.calls[onDrag.mock.calls.length - 1];
    return lastCall[2];
  };

  const { container } = renderGrid();
  const { gridItem, gridLayout } = getGridElements(container);

  mockRect(gridLayout, { top: 500, left: 0, width: 1200, height: 600 });
  mockRect(gridItem, { top: 510, left: 10, width: 190, height: 60 });

  startDragAt(gridItem, { x: 20, y: 520 });
  moveMouseTo(25, 525, gridItem);

  expect(onDragStart).toHaveBeenCalled();

  moveMouseTo(30, 530, gridItem);

  expect(onDrag).toHaveBeenCalled();

  const newItem = lastDragNewItem();
  expect(newItem.y).toBeLessThan(5);

  endDragAt(30, 530);
});