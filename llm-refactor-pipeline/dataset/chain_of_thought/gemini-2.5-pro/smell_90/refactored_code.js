it("uses default threshold of 3px when not specified (v2 API)", () => {
  const onDragStart = jest.fn();
  const defaultThreshold = 3;
  const startPosition = { clientX: 50, clientY: 50 };
  const positionBelowThreshold = {
    clientX: startPosition.clientX + defaultThreshold - 1,
    clientY: startPosition.clientY
  };
  const positionAboveThreshold = {
    clientX: startPosition.clientX + defaultThreshold + 1,
    clientY: startPosition.clientY
  };

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
    dispatchMouseEvent(gridItem, "mousedown", startPosition);
  });

  act(() => {
    mouseMove(positionBelowThreshold.clientX, positionBelowThreshold.clientY, gridItem);
  });
  expect(onDragStart).not.toHaveBeenCalled();

  act(() => {
    mouseMove(positionAboveThreshold.clientX, positionAboveThreshold.clientY, gridItem);
  });
  expect(onDragStart).toHaveBeenCalled();

  act(() => {
    const mouseUpEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: positionAboveThreshold.clientX,
      clientY: positionAboveThreshold.clientY,
      button: 0
    });
    document.dispatchEvent(mouseUpEvent);
  });
});