it("does not cause item to jump on drag start with default positionStrategy", function () {
      const onDrag = jest.fn();
      const onDragStart = jest.fn();

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

      gridLayout.getBoundingClientRect = () => ({
        ...gridLayout.getBoundingClientRect.bind(gridLayout)(),
        top: 500,
        left: 0,
        width: 1200,
        height: 600
      });

      gridItem.getBoundingClientRect = () => ({
        ...gridItem.getBoundingClientRect.bind(gridItem)(),
        top: 510,
        left: 10,
        width: 190,
        height: 60
      });

      act(() => {
        dispatchMouseEvent(gridItem, "mousedown", { clientX: 20, clientY: 520 });
      });

      act(() => {
        mouseMove(25, 525, gridItem);
      });

      expect(onDragStart).toHaveBeenCalled();

      act(() => {
        mouseMove(30, 530, gridItem);
      });

      expect(onDrag).toHaveBeenCalled();

      const dragCall = onDrag.mock.calls[onDrag.mock.calls.length - 1];
      const newItem = dragCall[2];

      expect(newItem.y).toBeLessThan(5);

      act(() => {
        document.dispatchEvent(
          new MouseEvent("mouseup", {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: 30,
            clientY: 530,
            button: 0
          })
        );
      });
    })