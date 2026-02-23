it("uses default threshold of 3px when not specified (v2 API)", function () {
  const onDragStart = jest.fn();

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

  const startDragAt = (x, y) =>
    act(() => {
      dispatchMouseEvent(gridItem, "mousedown", { clientX: x, clientY: y });
    });

  const moveTo = (x, y) =>
    act(() => {
      mouseMove(x, y, gridItem);
    });

  const endDragAt = (x, y) =>
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

  startDragAt(50, 50);

  moveTo(52, 50);
  expect(onDragStart).not.toHaveBeenCalled();

  moveTo(54, 50);
  expect(onDragStart).toHaveBeenCalled();

  endDragAt(54, 50);
});