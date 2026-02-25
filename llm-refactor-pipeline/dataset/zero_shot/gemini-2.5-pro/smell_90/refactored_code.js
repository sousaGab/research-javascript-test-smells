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

  act(() => {
    dispatchMouseEvent(gridItem, "mousedown", {
      clientX: 50,
      clientY: 50
    });
  });

  act(() => {
    mouseMove(52, 50, gridItem);
  });
  expect(onDragStart).not.toHaveBeenCalled();

  act(() => {
    mouseMove(54, 50, gridItem);
  });
  expect(onDragStart).toHaveBeenCalled();

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
});