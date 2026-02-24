it("does not cause item to jump on drag start with default positionStrategy", function () {
      const onDrag = jest.fn();
      const onDragStart = jest.fn();

      const mockBoundingClientRect = (element, rect) => {
        jest.spyOn(element, "getBoundingClientRect").mockReturnValue(rect);
      };

      // Create a grid with known position - item at grid position (0,0)
      // With width=1200, cols=12, rowHeight=30, margin=[10,10]
      // Item w=2, h=2 should be at pixel position (10, 10) with size 190x60
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

      // Mock getBoundingClientRect to simulate the grid being at y=500 on the page.
      // This is crucial for testing position-offset bugs that only appear when the
      // grid is not at the top of the viewport.
      mockBoundingClientRect(gridLayout, {
        top: 500,
        left: 0,
        width: 1200,
        height: 600
      });
      mockBoundingClientRect(gridItem, {
        top: 510, // Item is at y=10 relative to grid, so 500+10=510 on page
        left: 10,
        width: 190,
        height: 60
      });

      // Start drag - click at screen position (20, 520) which is inside the item
      // The item is at screen position (10, 510) to (200, 570)
      act(() => {
        dispatchMouseEvent(gridItem, "mousedown", {
          clientX: 20,
          clientY: 520 // Screen Y position (500 grid offset + 20)
        });
      });

      // Move a small amount (just enough to trigger drag start)
      act(() => {
        mouseMove(25, 525, gridItem);
      });

      expect(onDragStart).toHaveBeenCalled();

      // Now move a bit more
      act(() => {
        mouseMove(30, 530, gridItem);
      });

      expect(onDrag).toHaveBeenCalled();

      // onDrag signature: (layout, oldItem, newItem, placeholder, event, element)
      const lastCallArgs = onDrag.mock.calls.pop();
      const newItem = lastCallArgs[2];

      // The key test: verify the item hasn't jumped.
      // With the bug, y would be calculated from screen coordinates, resulting in a large value.
      // Correct behavior calculates y relative to the grid, keeping it near 0.
      expect(newItem.y).toBeLessThan(5);

      // Clean up
      act(() => {
        const mouseUpEvent = new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 30,
          clientY: 530,
          button: 0
        });
        document.dispatchEvent(mouseUpEvent);
      });
    });