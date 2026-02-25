it("handles items at x position beyond grid", () => {
      const layout = [
        { i: "a", x: 15, y: 0, w: 2, h: 2 } // Beyond 12 cols
      ];

      const compacted = fastVerticalCompactor.compact(layout, 12);

      // Item should be clamped to the rightmost edge of the grid.
      expect(compacted).toEqual([
        { i: "a", x: 10, y: 0, w: 2, h: 2 }
      ]);
    });