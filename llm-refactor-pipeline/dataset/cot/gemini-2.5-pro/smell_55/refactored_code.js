it("handles items at x position beyond grid", () => {
      const layout = [
        { i: "a", x: 15, y: 0, w: 2, h: 2 } // Beyond 12 cols
      ];

      const compacted = fastVerticalCompactor.compact(layout, 12);

      // Expect the item to be returned as-is, as the compactor's
      // responsibility is vertical, not horizontal, placement.
      expect(compacted).toEqual([
        { i: "a", x: 15, y: 0, w: 2, h: 2 }
      ]);
    });